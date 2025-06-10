// アプリケーション設定定数
export const CONFIG = {
  // ファイルパス
  DESK_LAYOUT_FILE: 'desk-layout-3d.yaml',
  
  // 3D表示設定
  CAMERA: {
    POSITION: [8, 6, 8] as [number, number, number],
    FOV: 75,
  },
  
  // グリッド設定
  GRID: {
    SIZE: 20,
    DIVISIONS: 40,
    OPACITY: 0.2,
  },
  
  // 座標系設定
  COORDINATE: {
    SCALE_FACTOR: 100, // cm to meters conversion
  },
  
  // UI設定
  UI: {
    HIDDEN_OPACITY: 0.3,
    SELECTED_OPACITY: 0.8,
    SELECTION_COLOR: '#ff6b6b',
  },
} as const

// ファイルパス取得関数
export const getLayoutFilePath = () => `/${CONFIG.DESK_LAYOUT_FILE}`
export const getLayoutFileServerPath = () => `public/${CONFIG.DESK_LAYOUT_FILE}`