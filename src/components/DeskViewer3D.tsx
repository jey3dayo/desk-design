'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box, Cylinder } from '@react-three/drei'
import { useEffect, useState } from 'react'
import * as yaml from 'js-yaml'
import { saveYamlFile } from '@/app/actions'
import { CONFIG, getLayoutFilePath } from '@/config/constants'

type Element3D = {
  name: string
  type: 'box' | 'cylinder'
  position: [number, number, number]
  size?: [number, number, number]
  radius?: number
  height?: number
  color: string
  hidden?: boolean
}

type DeskLayout = {
  elements: Element3D[]
}

function DeskElement({ element, isSelected, onSelect }: {
  element: Element3D
  isSelected?: boolean
  onSelect?: () => void
}) {
  const { name, type, position, size, radius, height, color } = element

  if (type === 'box' && size) {
    const scale = CONFIG.COORDINATE.SCALE_FACTOR
    return (
      <Box
        position={[position[0] / scale, position[2] / scale, -position[1] / scale]}
        args={[size[0] / scale, size[2] / scale, size[1] / scale]}
        onClick={onSelect}
      >
        <meshStandardMaterial
          key={`${color}-${element.hidden}`}
          color={isSelected ? CONFIG.UI.SELECTION_COLOR : color}
          transparent={isSelected || element.hidden}
          opacity={isSelected ? CONFIG.UI.SELECTED_OPACITY : element.hidden ? CONFIG.UI.HIDDEN_OPACITY : 1}
        />
      </Box>
    )
  }

  if (type === 'cylinder' && radius && height) {
    const scale = CONFIG.COORDINATE.SCALE_FACTOR
    return (
      <Cylinder
        position={[position[0] / scale, position[2] / scale, -position[1] / scale]}
        args={[radius / scale, radius / scale, height / scale]}
        onClick={onSelect}
      >
        <meshStandardMaterial
          key={`${color}-${element.hidden}`}
          color={isSelected ? CONFIG.UI.SELECTION_COLOR : color}
          transparent={isSelected || element.hidden}
          opacity={isSelected ? CONFIG.UI.SELECTED_OPACITY : element.hidden ? CONFIG.UI.HIDDEN_OPACITY : 1}
        />
      </Cylinder>
    )
  }

  return null
}

export default function DeskViewer3D() {
  const [layout, setLayout] = useState<DeskLayout | null>(null)
  const [selectedElement, setSelectedElement] = useState<Element3D | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch(getLayoutFilePath())
      .then(response => response.text())
      .then(yamlText => {
        const data = yaml.load(yamlText) as DeskLayout
        setLayout(data)
      })
      .catch(error => console.error('Error loading YAML:', error))
  }, [])

  const handleElementSelect = (element: Element3D, index: number) => {
    setSelectedElement(element)
    setSelectedIndex(index)
  }

  const handlePositionChange = (axis: 'x' | 'y' | 'z', value: string) => {
    if (!selectedElement || !layout || selectedIndex === null) return

    const numValue = parseFloat(value)
    if (isNaN(numValue)) return

    const newLayout = { ...layout }
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
    newLayout.elements[selectedIndex].position[axisIndex] = numValue

    setLayout(newLayout)
    setSelectedElement(newLayout.elements[selectedIndex])
  }

  const handleSizeChange = (axis: 'x' | 'y' | 'z', value: string) => {
    if (!selectedElement || !layout || selectedIndex === null || !selectedElement.size) return

    const numValue = parseFloat(value)
    if (isNaN(numValue)) return

    const newLayout = { ...layout }
    const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
    newLayout.elements[selectedIndex].size![axisIndex] = numValue

    setLayout(newLayout)
    setSelectedElement(newLayout.elements[selectedIndex])
  }

  const handleColorChange = (color: string) => {
    if (!selectedElement || !layout || selectedIndex === null) return

    const newLayout = { ...layout }
    newLayout.elements[selectedIndex].color = color

    setLayout(newLayout)
    setSelectedElement(newLayout.elements[selectedIndex])
  }

  const handleHiddenChange = (hidden: boolean) => {
    if (!selectedElement || !layout || selectedIndex === null) return

    const newLayout = { ...layout }
    newLayout.elements[selectedIndex].hidden = hidden

    setLayout(newLayout)
    setSelectedElement(newLayout.elements[selectedIndex])
  }

  const handleDeleteElement = (index: number, event: React.MouseEvent) => {
    event.stopPropagation() // 親要素の選択イベントを防ぐ
    
    if (!layout) return
    
    if (window.confirm('このオブジェクトを削除しますか？')) {
      const newLayout = { ...layout }
      newLayout.elements.splice(index, 1)
      
      setLayout(newLayout)
      
      // 削除されたオブジェクトが選択されていた場合、選択を解除
      if (selectedIndex === index) {
        setSelectedElement(null)
        setSelectedIndex(null)
      } else if (selectedIndex !== null && selectedIndex > index) {
        // 削除されたオブジェクトより後のインデックスを調整
        setSelectedIndex(selectedIndex - 1)
      }
    }
  }

  const handleNameChange = (name: string) => {
    if (!selectedElement || !layout || selectedIndex === null) return

    const newLayout = { ...layout }
    newLayout.elements[selectedIndex].name = name

    setLayout(newLayout)
    setSelectedElement(newLayout.elements[selectedIndex])
  }

  const saveToYaml = async () => {
    if (!layout) return

    try {
      const yamlContent = yaml.dump(layout)
      const result = await saveYamlFile(yamlContent)

      if (result.success) {
        alert('YAMLファイルが保存されました！')
      } else {
        throw new Error(result.error || '保存に失敗しました')
      }
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました: ' + error)
    }
  }

  if (!layout) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full h-screen relative">
      {/* オブジェクト一覧パネル */}
      <div className="absolute bottom-4 left-4 bg-gray-800 text-white p-4 rounded shadow-lg z-10 min-w-48 max-h-96 overflow-y-auto">
        <h3 className="font-bold mb-2 text-white">オブジェクト一覧</h3>
        <div className="space-y-1">
          {layout.elements.map((element, index) => (
            <div
              key={`${element.name}-${index}`}
              className={`p-2 rounded cursor-pointer text-sm transition-colors ${
                selectedIndex === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              }`}
              onClick={() => handleElementSelect(element, index)}
            >
              <div className="flex items-center justify-between">
                <span className={element.hidden ? 'opacity-50' : ''}>{element.name}</span>
                <div className="flex items-center space-x-1">
                  {element.hidden && (
                    <span className="text-xs opacity-50">🙈</span>
                  )}
                  <button
                    onClick={(e) => handleDeleteElement(index, e)}
                    className="text-red-400 hover:text-red-300 text-lg p-1 hover:bg-red-600/20 rounded transition-colors font-bold"
                    title="削除"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedElement && (
        <div className="absolute top-4 right-4 bg-gray-800 text-white p-4 rounded shadow-lg z-10 min-w-64">
          <h3 className="font-bold mb-2 text-white">オブジェクト編集</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">名前</label>
              <input
                type="text"
                value={selectedElement.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">X座標 (mm)</label>
              <input
                type="number"
                value={selectedElement.position[0]}
                onChange={(e) => handlePositionChange('x', e.target.value)}
                className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">Y座標 (mm)</label>
              <input
                type="number"
                value={selectedElement.position[1]}
                onChange={(e) => handlePositionChange('y', e.target.value)}
                className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-200">Z座標 (mm)</label>
              <input
                type="number"
                value={selectedElement.position[2]}
                onChange={(e) => handlePositionChange('z', e.target.value)}
                className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white"
              />
            </div>
            {selectedElement.size && (
              <>
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <h4 className="text-sm font-medium text-gray-200 mb-2">サイズ</h4>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-200">幅 (mm)</label>
                  <input
                    type="number"
                    value={selectedElement.size[0]}
                    onChange={(e) => handleSizeChange('x', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-200">奥行き (mm)</label>
                  <input
                    type="number"
                    value={selectedElement.size[1]}
                    onChange={(e) => handleSizeChange('y', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-200">高さ (mm)</label>
                  <input
                    type="number"
                    value={selectedElement.size[2]}
                    onChange={(e) => handleSizeChange('z', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white"
                  />
                </div>
              </>
            )}
            <div className="border-t border-gray-600 pt-2 mt-2">
              <label className="block text-sm font-medium mb-1 text-gray-200">色</label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={selectedElement.color.startsWith('#') ? selectedElement.color : '#4F4F4F'}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-12 h-8 border border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedElement.color}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-600 rounded bg-gray-700 text-white text-sm"
                  placeholder="#000000 or rgba(255,255,255,0.5)"
                />
              </div>
            </div>
            <div className="border-t border-gray-600 pt-2 mt-2">
              <label className="flex items-center space-x-2 text-gray-200">
                <input
                  type="checkbox"
                  checked={selectedElement.hidden || false}
                  onChange={(e) => handleHiddenChange(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">非表示 (透明度30%)</span>
              </label>
            </div>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={saveToYaml}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-1 px-2 rounded"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setSelectedElement(null)
                  setSelectedIndex(null)
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-1 px-2 rounded"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      <Canvas
        camera={{ position: CONFIG.CAMERA.POSITION, fov: CONFIG.CAMERA.FOV }}
        onPointerMissed={() => {
          setSelectedElement(null)
          setSelectedIndex(null)
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />

        {layout.elements.map((element, index) => (
          <DeskElement
            key={`${element.name}-${index}`}
            element={element}
            isSelected={selectedIndex === index}
            onSelect={() => handleElementSelect(element, index)}
          />
        ))}

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

        <gridHelper args={[CONFIG.GRID.SIZE, CONFIG.GRID.DIVISIONS]} material-opacity={CONFIG.GRID.OPACITY} material-transparent={true} />
      </Canvas>
    </div>
  )
}
