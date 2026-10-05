import type { ReconstructConflict, ReconstructSceneData } from '@/types';

/**
 * 还原台的判定。纯函数，唯一出口——组件里不得再比对行 id 或判断解锁条件。
 *
 * 纪律：矛盾对是"声明"，不是算法从时间戳里推出来的——
 * 与对照物独占值同理：声明得看得见，才会有人去改数据。
 */

/** 两行是否构成已声明的矛盾（与先后顺序无关）。 */
export function findConflict(
  scene: ReconstructSceneData,
  a: string,
  b: string,
): ReconstructConflict | null {
  return (
    scene.conflicts.find((c) => (c.rowA === a && c.rowB === b) || (c.rowA === b && c.rowB === a)) ??
    null
  );
}

/** 是否全部矛盾都已登记。 */
export function allMarked(scene: ReconstructSceneData, marks: string[]): boolean {
  return scene.conflicts.every((c) => marks.includes(c.id));
}

/**
 * 该场景的"通过项"处置 id：声明了隐藏项的用隐藏项，未声明时用默认 'both'。
 * 组件与投放判定都只从这里取——不得在别处硬编码 'both'。
 */
export function passVerdictId(scene: ReconstructSceneData): string {
  return scene.verdicts?.find((v) => v.hidden)?.id ?? 'both';
}

/** 帧数据重建的解锁条件：选择了"通过项"且全部矛盾已登记。 */
export function frameUnlocked(
  scene: ReconstructSceneData,
  marks: string[],
  verdict: string | undefined,
): boolean {
  return verdict === passVerdictId(scene) && allMarked(scene, marks);
}

/** 处置选项出现条件：已登记的矛盾达到三处（隐藏选项由此现身）。 */
export const VERDICT_THRESHOLD = 3;

export function verdictSelectable(marks: string[]): boolean {
  return marks.length >= VERDICT_THRESHOLD;
}