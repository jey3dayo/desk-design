'use server'

import { writeFileSync } from 'fs'
import { join } from 'path'

export async function saveYamlFile(content: string) {
  try {
    if (!content) {
      throw new Error('Content is required')
    }

    // publicディレクトリのlayout.yamlに保存
    const filePath = join(process.cwd(), 'public', 'layout.yaml')
    writeFileSync(filePath, content, 'utf8')

    return { success: true, message: 'YAML file saved successfully' }
  } catch (error) {
    console.error('Error saving YAML file:', error)
    return { success: false, error: 'Failed to save YAML file' }
  }
}
