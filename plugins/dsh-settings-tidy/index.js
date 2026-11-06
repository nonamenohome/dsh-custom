// dsh-settings-tidy —— 宿主半侧（空壳）
//
// 这个插件只在浏览器里干活：把设置面板的左侧导航整理成「同类相邻 + 去掉重复入口」。
// 宿主侧不需要任何服务或路由，声明一个空 apply 只是为了让它能作为 bundle 装进来。
export const name = 'settings-tidy';

export function apply() {}
