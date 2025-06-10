// アプリケーション設定定数
export const CONFIG = {
  // ファイルパス
  DESK_LAYOUT_FILE: 'desk-layout-3d.yaml',
  
  // 3D表示設定
  CAMERA: {
    POSITION: [3, 2, 2] as [number, number, number],
    FOV: 50,
  },
  
  // グリッド設定
  GRID: {
    SIZE: 2,
    DIVISIONS: 20,
    OPACITY: 0.2,
  },
  
  // 座標系設定
  COORDINATE: {
    SCALE_FACTOR: 100, // mm to meters conversion
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