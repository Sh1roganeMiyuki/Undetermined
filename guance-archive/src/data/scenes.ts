import type { ReconstructSceneData } from '@/types';
import { CASE1207_SCENE } from '@/data/case1207';
import { DAYLIGHT_SCENE } from '@/data/daylight';

/**
 * 还原台场景的查找表：scene 块按 id 取数据。
 * 场景数据单独聚合（同 entries 的模式），组件不直接依赖具体章节文件。
 */
export const SCENES: Record<string, ReconstructSceneData> = {
  [CASE1207_SCENE.id]: CASE1207_SCENE,
  [DAYLIGHT_SCENE.id]: DAYLIGHT_SCENE,
};