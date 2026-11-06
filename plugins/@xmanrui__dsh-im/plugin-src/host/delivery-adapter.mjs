import { createHash } from 'node:crypto';
import {
  deliverySuggestionsFromSessions,
  privateConversationKeyMatchesTarget,
  privateDeliverySuggestionFromConversationKey,
  resolvePrivateConversationKey,
} from './delivery-suggestions.mjs';
import { withSessionBindingLock } from '../../src/channels/shared/session-binding-lock.mjs';
import { dsBotError } from './ds-bot-client.mjs';

const CHANNELS = new Set([
  'weixin',
  'feishu',
  'dingtalk',
  'wecom',
  'wecom-app',
  'qq',
  'slack',
  'telegram',
  'discord',
  'whatsapp',
  'imessage',
  'email',
  'matrix',
]);

export function supportsDeliveryChannel(channel) {
  return CHANNELS.has(channel);
}

function invalidTarget(message) {
  const error = new Error(message);
  error.code = 'invalid-target';
  return error;
}

function sessionSyncUnavailable(message = 'Session sync is unavailable for this target') {
  const error = new Error(message);
  error.code = 'session-sync-unavailable';
  return error;
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value, allowed, label) {
  if (!isRecord(value)) throw invalidTarget(`${label} must be an object`);
  const extra = Object.keys(value).find((key) => !allowed.includes(key));
  if (extra !== undefined) throw invalidTarget(`${label} contains an unknown field`);
}

function requiredString(value, label) {
  if (typeof value !== 'string' || !value || value.trim() !== value) {
    throw invalidTarget(`${label} must be a non-empty string without surrounding whitespace`);
  }
  return value;
}

function targetName(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 80) {
    throw invalidTarget('target.name must contain 1 to 80 characters');
  }
  return value.trim();
}

function routeWithStrings(route, fields) {
  exactKeys(route, fields, 'route');
  const normalized = {};
  for (const field of fields) normalized[field] = requiredString(route[field], `route.${field}`);
  return normalized;
}

function oneOf(value, choices) {
  if (!choices.includes(value)) throw invalidTarget('target kind is not supported by this channel');
  return value;
}

function normalizeRoute(channel, kind, route) {
  switch (channel) {
    case 'weixin':
      oneOf(kind, ['user']);
      return routeWithStrings(route, ['toUserId']);
    case 'feishu':
      oneOf(kind, ['user', 'group']);
      return routeWithStrings(route, kind === 'user' ? ['openId'] : ['chatId']);
    case 'dingtalk':
      oneOf(kind, ['user', 'group']);
      return routeWithStrings(route, kind === 'user' ? ['userId'] : ['openConversationId']);
    case 'wecom':
      oneOf(kind, ['user', 'group']);
      return routeWithStrings(route, ['chatId']);
    case 'wecom-app':
      oneOf(kind, ['user']);
      return routeWithStrings(route, ['chatId']);
    case 'qq':
      oneOf(kind, ['user', 'group']);
      return routeWithStrings(route, kind === 'user' ? ['userOpenId'] : ['groupOpenId']);
    case 'slack': {
      oneOf(kind, ['conversation', 'thread']);
      const normalized = routeWithStrings(
        route,
        kind === 'conversation' ? ['channelId'] : ['channelId', 'threadTs'],
      );
      return normalized;
    }
    case 'telegram': {
      oneOf(kind, ['chat', 'topic']);
      exactKeys(route, kind === 'chat' ? ['chatId'] : ['chatId', 'messageThreadId'], 'route');
      const chatId = requiredString(route.chatId, 'route.chatId');
      if (!/^-?\d+$/.test(chatId)) throw invalidTarget('route.chatId must be a decimal string');
      if (kind === 'chat') return { chatId };
      if (!Number.isSafeInteger(route.messageThreadId) || route.messageThreadId <= 0) {
        throw invalidTarget('route.messageThreadId must be a positive integer');
      }
      return { chatId, messageThreadId: route.messageThreadId };
    }
    case 'discord':
      oneOf(kind, ['channel']);
      return routeWithStrings(route, ['channelId']);
    case 'whatsapp': {
      oneOf(kind, ['user', 'group']);
      const normalized = routeWithStrings(route, ['jid']);
      const valid = kind === 'user'
        ? /^\d{5,32}@(s\.whatsapp\.net|lid)$/.test(normalized.jid)
        : /^\d{5,32}(?:-\d{1,32})?@g\.us$/.test(normalized.jid);
      if (!valid) {
        throw invalidTarget(`route.jid must be a ${kind} WhatsApp JID`);
      }
      return normalized;
    }
    case 'imessage':
      oneOf(kind, ['user']);
      return routeWithStrings(route, ['chatGuid']);
    case 'email': {
      oneOf(kind, ['user']);
      const normalized = routeWithStrings(route, ['address']);
      // Mail addresses are normalized to lower case everywhere so a target
      // created from a mixed-case address still matches.
      if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(normalized.address)) {
        throw invalidTarget('route.address must be a valid email address');
      }
      return { address: normalized.address.toLowerCase() };
    }
    case 'matrix': {
      oneOf(kind, ['room', 'thread', 'dm']);
      const normalized = routeWithStrings(
        route,
        kind === 'room' ? ['roomId'] : kind === 'thread' ? ['roomId', 'threadId'] : ['userId'],
      );
      if (kind === 'dm' && !/^@[^:\s]+:[^\s:]+(?::\d{1,5})?$/u.test(normalized.userId)) {
        throw invalidTarget('route.userId must be a Matrix user id');
      }
      if (kind !== 'dm' && !/^[!][^:$\s]+:[^\s:$]+(?::\d{1,5})?$/.test(normalized.roomId)) {
        throw invalidTarget('route.roomId must be a Matrix room id');
      }
      if (kind === 'thread' && !/^\$[^\s]+/.test(normalized.threadId)) {
        throw invalidTarget('route.threadId must be a Matrix event id');
      }
      return normalized;
    }
    default:
      throw new TypeError(`Unsupported delivery channel: ${channel}`);
  }
}

/** Strictly validate and copy one channel delivery target. */
export function normalizeDeliveryTarget(channel, value, { targetIdRequired = true } = {}) {
  if (!supportsDeliveryChannel(channel)) throw new TypeError(`Unsupported delivery channel: ${channel}`);
  exactKeys(
    value,
    targetIdRequired ? ['targetId', 'name', 'kind', 'route'] : ['name', 'kind', 'route'],
    'target',
  );
  const normalized = {};
  if (targetIdRequired) normalized.targetId = requiredString(value.targetId, 'target.targetId');
  if (value.name !== undefined) normalized.name = targetName(value.name);
  normalized.kind = requiredString(value.kind, 'target.kind');
  normalized.route = normalizeRoute(channel, normalized.kind, value.route);
  return normalized;
}

function targetWithoutSessionSync(target) {
  return {
    targetId: target.targetId,
    ...(target.name === undefined ? {} : { name: target.name }),
    kind: target.kind,
    route: target.route,
  };
}

function sessionSyncConfigs(workspaces, botId) {
  if (typeof workspaces.listSessionSyncTargets !== 'function') return [];
  const targets = workspaces.listSessionSyncTargets();
  return botId === undefined ? targets : targets.filter((target) => target.botId === botId);
}

/** Bindings own their private-chat sync while active. Ordinary delivery
 * settings remain saved and resume after unbinding, without duplicate mirrors. */
export function configuredSessionSyncTargets(workspaces, botId) {
  const bindings = (workspaces.listDsBotBindings?.(botId) ?? []).map((binding) => ({
    ...binding,
    targetId: `__dsbot_${createHash('sha256').update(binding.conversationKey).digest('hex').slice(0, 32)}`,
  }));
  return [
    ...bindings,
    ...sessionSyncConfigs(workspaces, botId).filter((target) => !bindings.some((binding) => (
      binding.botId === target.botId && binding.conversationKey === target.conversationKey
    ))),
  ];
}

export function sessionSyncTarget(channel, workspaces, configured) {
  if (!configured) return null;
  if (!configured.dsBotId) return workspaces.deliveryTargetFor(configured.botId, configured.targetId);
  const target = privateDeliverySuggestionFromConversationKey(channel, configured.conversationKey);
  return target ? { ...target, targetId: configured.targetId } : null;
}

function stateSessions(state) {
  if (!state || typeof state.snapshot !== 'function') return null;
  const sessions = state.snapshot()?.sessions;
  return sessions && typeof sessions === 'object' && !Array.isArray(sessions) ? sessions : null;
}

function sessionSyncView(channel, target, sessions, configured) {
  if (configured) {
    const valid = privateConversationKeyMatchesTarget(
      channel,
      configured.conversationKey,
      target,
    );
    if (!valid || !sessions) return { enabled: true, state: 'unavailable' };
    return {
      enabled: true,
      state: typeof sessions[configured.conversationKey] === 'string'
        && Boolean(sessions[configured.conversationKey])
        ? 'active'
        : 'waiting',
    };
  }
  const conversationKey = sessions
    ? resolvePrivateConversationKey(channel, sessions, target)
    : null;
  return { enabled: false, state: conversationKey ? 'off' : 'unavailable' };
}

/** Bind one channel's existing workspace store and unwrapped controller to DeliveryService. */
export function createDeliveryAdapter({ channel, workspaces, coreController, stateFor, dsBot }) {
  if (!supportsDeliveryChannel(channel)) throw new TypeError(`Unsupported delivery channel: ${channel}`);
  if (!workspaces || typeof workspaces !== 'object') {
    throw new TypeError('delivery adapter requires a workspace store');
  }
  if (!coreController || typeof coreController !== 'object') {
    throw new TypeError('delivery adapter requires a proactive text controller');
  }
  if (typeof stateFor !== 'function') {
    throw new TypeError('delivery adapter requires a bot state getter');
  }
  const syncTarget = async (botId, targetId, sessionId, { allowParts = true } = {}) => {
    const configured = configuredSessionSyncTargets(workspaces, botId).find((entry) => entry.targetId === targetId);
    const target = sessionSyncTarget(channel, workspaces, configured);
    if (!configured || !target || !privateConversationKeyMatchesTarget(channel, configured.conversationKey, target)) {
      throw sessionSyncUnavailable('Session sync target is no longer enabled');
    }
    const sessions = stateSessions(await stateFor(botId));
    const bot = configured.dsBotId ? await dsBot?.resolve(configured.dsBotId) : null;
    const matches = configured.dsBotId
      ? bot && (bot.sessionId === sessionId || (allowParts && bot.parts?.includes(sessionId)))
      : sessions?.[configured.conversationKey] === sessionId;
    if (!matches) {
      throw sessionSyncUnavailable('Session sync target is no longer bound to this Session');
    }
    return { target, conversationKey: configured.conversationKey, dsBotId: configured.dsBotId };
  };
  const describeSyncTarget = async (botId, targetId, sessionId) => {
    const { conversationKey } = await syncTarget(botId, targetId, sessionId);
    return { conversationKey };
  };
  const presentSyncInteraction = async (method, botId, targetId, sessionId, interaction, options = {}) => {
    // Text from an old part may finish delivery, but a new question answer must
    // still belong to the Bot's current session.
    const routeOptions = { allowParts: method !== 'presentSessionSyncQuestion' };
    const original = await syncTarget(botId, targetId, sessionId, routeOptions);
    if (typeof coreController[method] !== 'function') return false;
    const validate = async () => {
      const current = await syncTarget(botId, targetId, sessionId, routeOptions);
      if (current.conversationKey !== original.conversationKey || current.dsBotId !== original.dsBotId
        || options.signal?.aborted) throw sessionSyncUnavailable('The interaction route changed or ended');
    };
    const guarded = {
      ...interaction,
      respond: async (result, responseOptions) => {
        try { await validate(); }
        catch (error) {
          await interaction.withdraw?.();
          throw Object.assign(new Error('Interaction route is no longer available', { cause: error }), {
            code: 'interaction-not-pending',
          });
        }
        return interaction.respond(result, responseOptions);
      },
    };
    return coreController[method](botId, original.target, guarded, {
      ...options, key: original.conversationKey, validate,
    });
  };
  return Object.freeze({
    channel,
    consumeInbound: (botId, options) => {
      if (typeof coreController.consumeInbound !== 'function')
        throw Object.assign(new Error('capability-unavailable'), { code: 'capability-unavailable' });
      return coreController.consumeInbound(botId, options);
    },
    historyChecked: (botId, route, query, options) => {
      if (typeof coreController.historyChecked !== 'function')
        throw Object.assign(new Error('capability-unavailable'), { code: 'capability-unavailable' });
      return coreController.historyChecked(botId, route, query, options);
    },
    replyChecked: (botId, route, text, options) => {
      if (typeof coreController.replyChecked !== 'function')
        throw Object.assign(new Error('capability-unavailable'), { code: 'capability-unavailable' });
      return coreController.replyChecked(botId, route, text, options);
    },
    describeAccount: (botId) => {
      if (typeof coreController.describeDeliveryAccount !== 'function') {
        const error = new Error('Verified account capability unavailable');
        error.code = 'capability-unavailable';
        throw error;
      }
      return coreController.describeDeliveryAccount(botId);
    },
    ownsBot: (botId) => workspaces.has(botId),
    listBots: () => workspaces.listBotIds(),
    listDsBotBindings: () => workspaces.listDsBotBindings().filter(({ conversationKey }) => (
      privateDeliverySuggestionFromConversationKey(channel, conversationKey)
    )),
    async listTargets(botId) {
      const targets = workspaces.listDeliveryTargets(botId);
      const configured = new Map(
        sessionSyncConfigs(workspaces, botId).map((target) => [target.targetId, target]),
      );
      let sessions = null;
      try {
        sessions = stateSessions(await stateFor(botId));
      } catch {
        // Target CRUD remains usable when its persisted conversation state cannot be read.
      }
      return targets.map((target) => ({
        ...target,
        sessionSync: sessionSyncView(channel, target, sessions, configured.get(target.targetId)),
      }));
    },
    async listDsBotConversations(botId) {
      const sessions = stateSessions(await stateFor(botId)) ?? {};
      const keys = new Set([...Object.keys(sessions), ...workspaces.dsBotConversationKeys(botId)]);
      return [...keys].flatMap((conversationKey) => {
        const route = privateDeliverySuggestionFromConversationKey(channel, conversationKey);
        if (!route) return [];
        const binding = workspaces.dsBotBindingFor(botId, conversationKey);
        const address = String(Object.values(route.route)[0]);
        return [{ conversationKey, address, ...(binding ? { dsBotId: binding.dsBotId } : {}) }];
      });
    },
    async bindDsBot(botId, conversationKey, dsBotId) {
      if (!dsBot) throw dsBotError();
      if (!privateDeliverySuggestionFromConversationKey(channel, conversationKey)) {
        throw dsBotError('ds-bot-private-required');
      }
      const state = await stateFor(botId);
      return withSessionBindingLock(state, conversationKey, async () => {
        if (workspaces.listDsBotBindings(botId).some((binding) => (
          binding.conversationKey === conversationKey || binding.dsBotId === dsBotId
        ))) throw dsBotError('ds-bot-binding-conflict');
        if (!state.sessionFor(conversationKey) && !workspaces.dsBotConversationKeys(botId).includes(conversationKey)) {
          throw dsBotError('ds-bot-private-required');
        }
        const bot = await dsBot.resolve(dsBotId);
        const previousSession = state.sessionFor(conversationKey);
        await state.setSession(conversationKey, bot.sessionId);
        try {
          return await workspaces.setDsBotBinding(botId, conversationKey, dsBotId);
        } catch (error) {
          if (previousSession) await state.setSession(conversationKey, previousSession);
          else await state.clearSession(conversationKey);
          throw error;
        }
      });
    },
    async unbindDsBot(botId, conversationKey) {
      const state = await stateFor(botId);
      return withSessionBindingLock(state, conversationKey, async () => {
        if (!workspaces.dsBotBindingFor(botId, conversationKey)) return false;
        await state.clearSession(conversationKey);
        await workspaces.setDsBotBinding(botId, conversationKey, null);
        return true;
      });
    },
    async listSuggestions(botId) {
      const state = await stateFor(botId);
      if (!state || typeof state.snapshot !== 'function') {
        throw new TypeError('delivery suggestion state cannot be inspected');
      }
      const suggestions = deliverySuggestionsFromSessions(channel, state.snapshot()?.sessions);
      return suggestions.map((suggestion) => normalizeDeliveryTarget(
        channel,
        suggestion,
        { targetIdRequired: false },
      ));
    },
    createTarget: (botId, target) => workspaces.createDeliveryTarget(
      botId,
      normalizeDeliveryTarget(channel, target),
    ),
    updateTarget: (botId, targetId, replacement) => workspaces.updateDeliveryTarget(
      botId,
      targetId,
      normalizeDeliveryTarget(channel, replacement, { targetIdRequired: false }),
    ),
    deleteTarget: (botId, targetId) => workspaces.deleteDeliveryTarget(botId, targetId),
    async sendText(botId, target, text, options = {}) {
      const normalized = normalizeDeliveryTarget(channel, targetWithoutSessionSync(target));
      if (typeof coreController.sendProactiveText !== 'function') {
        throw new TypeError('delivery controller cannot send proactive text');
      }
      const result = await coreController.sendProactiveText(botId, normalized, text, options);
      return options.receipt === true ? result : { sent: true };
    },
    async setSessionSync(botId, targetId, enabled) {
      if (typeof workspaces.setDeliveryTargetSessionSync !== 'function') {
        throw sessionSyncUnavailable();
      }
      const target = workspaces.deliveryTargetFor(botId, targetId);
      if (!target) {
        const error = new Error('Unknown target');
        error.code = 'unknown-target';
        throw error;
      }
      if (!enabled) {
        await workspaces.setDeliveryTargetSessionSync(botId, targetId, null);
        let sessions = null;
        try {
          sessions = stateSessions(await stateFor(botId));
        } catch {
          // The setting is already safely disabled; only its availability is unknown.
        }
        return sessionSyncView(channel, target, sessions, null);
      }
      const sessions = stateSessions(await stateFor(botId));
      const conversationKey = resolvePrivateConversationKey(channel, sessions, target);
      if (!conversationKey) throw sessionSyncUnavailable();
      await workspaces.setDeliveryTargetSessionSync(botId, targetId, conversationKey);
      return { enabled: true, state: 'active' };
    },
    async listSessionSyncTargets(sessionId) {
      if (typeof sessionId !== 'string' || !sessionId) {
        throw new TypeError('sessionId is required');
      }
      const matches = [];
      for (const configured of configuredSessionSyncTargets(workspaces)) {
        const target = sessionSyncTarget(channel, workspaces, configured);
        if (!target || !privateConversationKeyMatchesTarget(
          channel,
          configured.conversationKey,
          target,
        )) continue;
        let currentId;
        try {
          currentId = configured.dsBotId
            ? (await dsBot?.resolve(configured.dsBotId))?.sessionId
            : stateSessions(await stateFor(configured.botId))?.[configured.conversationKey];
        } catch {
          continue;
        }
        if (currentId === sessionId) {
          matches.push({ botId: configured.botId, targetId: configured.targetId });
        }
      }
      return matches;
    },
    describeSessionSyncApprovalTarget: describeSyncTarget,
    describeSessionSyncQuestionTarget: describeSyncTarget,
    async presentSessionSyncApproval(botId, targetId, sessionId, interaction, options = {}) {
      return presentSyncInteraction('presentSessionSyncApproval', botId, targetId, sessionId, interaction, options);
    },
    async presentSessionSyncQuestion(botId, targetId, sessionId, interaction, options = {}) {
      return presentSyncInteraction('presentSessionSyncQuestion', botId, targetId, sessionId, interaction, options);
    },
    async sendSessionSyncText(botId, targetId, sessionId, text, options = {}) {
      if (typeof text !== 'string' || !text.trim()) throw new TypeError('text is required');
      const { target } = await syncTarget(botId, targetId, sessionId);
      if (typeof coreController.sendProactiveText !== 'function') {
        throw new TypeError('delivery controller cannot send proactive text');
      }
      const result = await coreController.sendProactiveText(botId, target, text, options);
      // Rich senders may report failure without throwing. Never report these
      // as success, or retry an uncertain send that may already be visible.
      if (result === false || result?.sent === false
        || result?.deliveryOutcome === 'failed' || result?.deliveryOutcome === 'unknown') {
        const error = new Error('Session sync delivery was not confirmed');
        error.code = result?.deliveryOutcome === 'unknown' ? 'send-result-unknown' : 'delivery-failed';
        throw error;
      }
      return { sent: true };
    },
  });
}
