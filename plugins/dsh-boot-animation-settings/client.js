/**
 * dsh-boot-animation-settings — browser half.
 *
 * One Settings section ("开机动画") listing every clip that
 * dsh-boot-animation-pro knows about — the four embedded ones plus any video in
 * `$DSH_HOME/boot-animation-pro/videos/` — with a preview and a radio-style
 * "选它" action that writes the global selection.
 *
 * The pro plugin is the owner of the library and of the selection file; this
 * file only speaks its two public endpoints:
 *   GET  /dsh-boot-animation-pro/videos.json
 *   POST /dsh-boot-animation-pro/select   { selectedClipId }
 */
window.__ModuleLoader__.load({
  id: "dsh-boot-animation-settings",
  factory: function (require) {
    var React = require("react");
    var h = React.createElement;
    var useState = React.useState;
    var useEffect = React.useEffect;
    var useCallback = React.useCallback;

    var API = "/dsh-boot-animation-pro";
    var BRAND = "var(--dsw-alias-state-business-primary, #2563eb)";
    var FG = "var(--dsw-alias-label-primary, #111827)";
    var MUTED = "var(--dsw-alias-label-secondary, #6b7280)";
    var LINE = "var(--dsw-alias-border-l2, #e5e7eb)";
    var BG = "var(--dsw-alias-bg-layer-1, #ffffff)";
    var SOFT = "var(--dsw-alias-bg-layer-2, #f9fafb)";
    var OK = "var(--dsw-alias-state-success-primary, #16a34a)";
    var ERR = "var(--dsw-alias-state-error-primary, #dc2626)";

    function mb(bytes) {
      var n = Number(bytes) || 0;
      if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + " MB";
      return Math.max(1, Math.round(n / 1024)) + " KB";
    }

    function kindLabel(clip) {
      if (clip.kind === "embedded") return "插件自带";
      if (clip.kind === "user") return "你自己的";
      return "目录";
    }

    function Row(props) {
      var clip = props.clip;
      var selected = props.selected;
      var busy = props.busy;
      var onPick = props.onPick;
      var onPreview = props.onPreview;
      var isPreview = props.preview === clip.id;

      return h("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 10px",
          borderRadius: 10,
          border: "1px solid " + (selected ? BRAND : LINE),
          background: selected ? "color-mix(in srgb, " + BRAND + " 8%, " + BG + ")" : BG,
          boxSizing: "border-box"
        }
      },
        h("button", {
          type: "button",
          "aria-pressed": selected ? "true" : "false",
          title: selected ? "当前选择" : "选它",
          onClick: function () { onPick(clip); },
          disabled: !!busy,
          style: {
            width: 18,
            height: 18,
            flex: "0 0 18px",
            borderRadius: 999,
            border: "2px solid " + (selected ? BRAND : LINE),
            background: BG,
            padding: 0,
            cursor: busy ? "default" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center"
          }
        }, selected ? h("span", {
          style: { width: 8, height: 8, borderRadius: 999, background: BRAND, display: "block" }
        }) : null),
        h("div", { style: { minWidth: 0, flex: 1 } },
          h("div", { style: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },
            h("span", {
              style: { color: FG, fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }
            }, clip.name || clip.id),
            selected ? h("span", {
              style: {
                fontSize: 11, lineHeight: "16px", padding: "0 6px", borderRadius: 999,
                background: BRAND, color: "#fff", fontWeight: 650
              }
            }, "当前") : null,
            clip.active && !selected ? h("span", {
              style: { fontSize: 11, lineHeight: "16px", padding: "0 6px", borderRadius: 999, border: "1px solid " + OK, color: OK }
            }, "正在生效") : null
          ),
          h("div", { style: { color: MUTED, fontSize: 11, marginTop: 2, display: "flex", gap: 8, flexWrap: "wrap" } },
            h("span", null, kindLabel(clip)),
            h("span", null, mb(clip.bytes)),
            clip.faststart === false ? h("span", { style: { color: ERR } }, "未优化(faststart)") : null,
            clip.id ? h("span", { style: { opacity: 0.75 } }, clip.id) : null
          )
        ),
        h("button", {
          type: "button",
          onClick: function () { onPreview(isPreview ? null : clip.id); },
          style: {
            padding: "4px 10px", borderRadius: 8, border: "1px solid " + LINE,
            background: SOFT, color: FG, cursor: "pointer", fontSize: 12, fontWeight: 600
          }
        }, isPreview ? "收起" : "▶ 预览")
      );
    }

    function BootAnimationSettings() {
      var st = useState({ loading: true, error: "", clips: [], selected: null, userDir: "" });
      var state = st[0], setState = st[1];
      var pv = useState(null);
      var preview = pv[0], setPreview = pv[1];
      var bs = useState(null);
      var busy = bs[0], setBusy = bs[1];
      var nt = useState("");
      var note = nt[0], setNote = nt[1];

      var load = useCallback(function () {
        setState(function (s) { return Object.assign({}, s, { loading: true, error: "" }); });
        fetch(API + "/videos.json", { cache: "no-store" })
          .then(function (r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
          })
          .then(function (data) {
            var clips = Array.isArray(data.videos) ? data.videos : [];
            var selected = (data.settings && data.settings.selectedClipId) || data.selectedClipId || null;
            setState({
              loading: false,
              error: "",
              clips: clips,
              selected: selected,
              userDir: typeof data.userDir === "string" ? data.userDir : ""
            });
          })
          .catch(function (e) {
            setState(function (s) {
              return Object.assign({}, s, { loading: false, error: String((e && e.message) || e) });
            });
          });
      }, []);

      useEffect(function () { load(); }, [load]);

      var choose = function (clip) {
        if (!clip || busy) return;
        setBusy(clip.id);
        setNote("");
        fetch(API + "/select", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ selectedClipId: clip.id })
        })
          .then(function (r) { return r.json().catch(function () { return { ok: false, error: "invalid json" }; }); })
          .then(function (data) {
            if (!data || data.ok !== true) throw new Error((data && (data.error || data.message)) || "保存失败");
            setState(function (s) { return Object.assign({}, s, { selected: clip.id }); });
            setNote("已选择「" + (clip.name || clip.id) + "」，下次启动 DSH 时播放。");
          })
          .catch(function (e) { setNote("保存失败：" + String((e && e.message) || e)); })
          .then(function () { setBusy(null); });
      };

      var current = null;
      for (var i = 0; i < state.clips.length; i++) {
        if (state.clips[i].id === state.selected) { current = state.clips[i]; break; }
      }
      var previewClip = null;
      for (var j = 0; j < state.clips.length; j++) {
        if (state.clips[j].id === preview) { previewClip = state.clips[j]; break; }
      }

      return h("section", {
        "data-boot-animation-settings": "",
        style: { color: FG, fontSize: 13, lineHeight: "20px", display: "flex", flexDirection: "column", gap: 10 }
      },
        h("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" } },
          h("div", null,
            h("div", { style: { fontSize: 15, fontWeight: 650 } }, "开机动画"),
            h("div", { style: { color: MUTED, fontSize: 12, marginTop: 2 } },
              current ? ("当前：" + (current.name || current.id)) : "当前：自动（未指定，使用片库默认）"
            )
          ),
          h("div", { style: { display: "flex", gap: 8 } },
            h("button", {
              type: "button",
              onClick: load,
              disabled: state.loading,
              style: { padding: "5px 12px", borderRadius: 8, border: "1px solid " + LINE, background: SOFT, color: FG, cursor: "pointer", fontSize: 12, fontWeight: 600 }
            }, state.loading ? "刷新中…" : "刷新")
          )
        ),

        h("div", { style: { color: MUTED, fontSize: 12 } },
          "选一个作为每次启动 DSH 的片头。自己加片子：把 mp4 放进 ",
          h("code", { style: { fontSize: 11, padding: "1px 5px", borderRadius: 4, background: SOFT, border: "1px solid " + LINE } },
            state.userDir || "~/.dsh/boot-animation-pro/videos"),
          " 后点「刷新」。更多选项（分时段、触发规则、随机播放）在侧栏左下角的 🎛 里。"
        ),

        state.error ? h("div", { style: { color: ERR, fontSize: 12 } }, "加载失败：" + state.error) : null,

        previewClip ? h("div", {
          style: { border: "1px solid " + LINE, borderRadius: 10, overflow: "hidden", background: "#000" }
        }, h("video", {
          key: previewClip.id,
          src: previewClip.mediaUrl,
          controls: true,
          autoPlay: true,
          muted: true,
          playsInline: true,
          style: { display: "block", width: "100%", maxHeight: 260, background: "#000" }
        })) : null,

        h("div", { style: { display: "flex", flexDirection: "column", gap: 8 } },
          state.loading && state.clips.length === 0
            ? h("div", { style: { color: MUTED, fontSize: 12 } }, "读取片库…")
            : state.clips.map(function (clip) {
              return h(Row, {
                key: clip.id,
                clip: clip,
                selected: clip.id === state.selected,
                busy: busy === clip.id,
                preview: preview,
                onPick: choose,
                onPreview: setPreview
              });
            })
        ),

        state.clips.length > 1 ? h("div", {
          style: {
            display: "flex", alignItems: "center", gap: 8, paddingTop: 2
          }
        }, h("button", {
          type: "button",
          disabled: !!busy || state.selected === null,
          onClick: function () {
            var auto = {
              id: null,
              name: "自动（片库默认）"
            };
            if (busy) return;
            setBusy("auto");
            setNote("");
            fetch(API + "/select", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ selectedClipId: null })
            })
              .then(function (r) { return r.json(); })
              .then(function (data) {
                if (!data || data.ok !== true) throw new Error((data && (data.error || data.message)) || "保存失败");
                setState(function (s) { return Object.assign({}, s, { selected: null }); });
                setNote("已恢复自动：" + auto.name);
              })
              .catch(function (e) { setNote("保存失败：" + String((e && e.message) || e)); })
              .then(function () { setBusy(null); });
          },
          style: {
            padding: "5px 12px", borderRadius: 8, border: "1px solid " + LINE,
            background: BG, color: state.selected === null ? BRAND : MUTED,
            cursor: busy ? "default" : "pointer", fontSize: 12, fontWeight: 600
          }
        }, state.selected === null ? "✓ 自动（片库默认）" : "恢复自动（片库默认）")) : null,

        note ? h("div", {
          style: { fontSize: 12, color: note.indexOf("失败") === 0 ? ERR : OK }
        }, note) : null
      );
    }

    // ---- after the intro: land on the conversation -------------------------
    //
    // The intro is a full-screen overlay above whatever session/view the shell
    // restored. When it ends, the user must see the conversation no matter
    // which clip played or which view was restored last time. These helpers
    // observe the pro overlay (`.dbap-root`) and, once it leaves, bring the
    // chat surface forward.
    function readSessionId(uiSession) {
      try {
        var store = uiSession && uiSession.adapter && uiSession.adapter.current;
        if (!store || typeof store.getSnapshot !== "function") return null;
        var snap = store.getSnapshot();
        if (!snap || typeof snap !== "object") return null;
        var face = snap.hooks && snap.hooks.session;
        if (face && typeof face.getSnapshot === "function") {
          var s = face.getSnapshot();
          if (s && typeof s.sessionId === "string" && s.sessionId) return s.sessionId;
        }
        if (typeof snap.key === "string" && snap.key) return snap.key;
        if (snap.props && typeof snap.props.sessionId === "string" && snap.props.sessionId) return snap.props.sessionId;
      } catch (e) {}
      return null;
    }

    function chatVisible() {
      try {
        var composer = document.querySelector('[data-slot="conversation.composer"]');
        if (!composer) return false;
        if (composer.getClientRects && composer.getClientRects().length > 0) return true;
        return !!(composer.offsetWidth || composer.offsetHeight);
      } catch (e) {
        return false;
      }
    }

    function clickChatTab() {
      try {
        var tabs = document.querySelectorAll('[role="tab"]');
        for (var i = 0; i < tabs.length; i++) {
          var label = (tabs[i].textContent || "").trim();
          if (/^(对话|聊天|Chat|Conversation)$/i.test(label)) {
            tabs[i].click();
            return true;
          }
        }
      } catch (e) {}
      return false;
    }

    function landOnConversation(ctx) {
      if (typeof ctx.inject !== "function") return;
      ctx.inject(["uiSession", "uiWorkspace"], function (ready) {
        try {
          if (chatVisible()) return;
          var id = readSessionId(ready.uiSession);
          var ws = ready.uiWorkspace;
          if (id && ws && typeof ws.openSession === "function") ws.openSession(id);
          setTimeout(function () {
            if (!chatVisible()) clickChatTab();
          }, 400);
        } catch (e) {}
      });
    }

    function watchIntro(ctx) {
      if (typeof document === "undefined") return;
      var seen = false;
      var done = false;
      var observer = null;
      function overlay() {
        try { return document.querySelector(".dbap-root") !== null; } catch (e) { return false; }
      }
      if (overlay()) seen = true;
      try {
        observer = new MutationObserver(function () {
          if (overlay()) { seen = true; return; }
          if (!seen || done) return;
          done = true;
          observer.disconnect();
          landOnConversation(ctx);
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
      } catch (e) {
        return;
      }
      setTimeout(function () {
        try { observer.disconnect(); } catch (e) {}
      }, 180000);
    }

    // The black cover waits for the intro overlay, but a profile with the
    // intro switched off must not sit on it: when the trigger is 'off' the
    // client drops the cover as soon as the setting is known.
    function syncCoverWithTrigger() {
      if (typeof document === "undefined" || typeof window === "undefined") return;
      if (!document.getElementById("dsh-intro-cover")) return;
      fetch(API + "/videos.json", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          var mode = data && data.settings && data.settings.triggerMode;
          if (mode === "off" && typeof window.__dshIntroCoverReveal === "function") {
            window.__dshIntroCoverReveal();
          }
        })
        .catch(function () {});
    }

    function apply(ctx) {
      ctx.slots.inject("settings.section", function () {
        return ctx.slots.register({
          name: "settings.section",
          id: "boot-animation-picker",
          order: 56,
          label: function () { return "开机动画"; },
          inject: function () { return {}; }
        }, BootAnimationSettings);
      });
      watchIntro(ctx);
      syncCoverWithTrigger();
    }

    return {
      name: "dsh-boot-animation-settings",
      inject: ["slots"],
      apply: apply
    };
  }
});
