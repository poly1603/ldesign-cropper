/**
 * Selection Toolbar UI
 * Provides UI controls for selection and mask tools
 */

import { createElement, setStyles } from '../utils/dom'
import { dispatch } from '../utils/events'
import type { Selection, SelectionType, SelectionMode } from '../core/Selection'
import type { MaskManager } from '../core/MaskManager'

export interface SelectionToolbarOptions {
  position?: 'top' | 'bottom' | 'left' | 'right'
  theme?: 'light' | 'dark'
  compact?: boolean
}

interface Tool {
  id: string
  type: 'selection' | 'mask' | 'action'
  icon: string
  label: string
  tooltip: string
  action?: () => void
  active?: boolean
  group?: string
}

export class SelectionToolbar {
  private container: HTMLElement
  private options: Required<SelectionToolbarOptions>
  private selection: Selection | null = null
  private maskManager: MaskManager | null = null

  private toolbar: HTMLElement | null = null
  private tools: Map<string, Tool> = new Map()
  private activeSelectionTool: string = 'rectangle'
  private selectionMode: SelectionMode = 'new'

  // UI Elements
  private toolButtons: Map<string, HTMLElement> = new Map()
  private brushControls: HTMLElement | null = null

  constructor(container: HTMLElement, options: SelectionToolbarOptions = {}) {
    this.container = container

    this.options = {
      position: options.position || 'top',
      theme: options.theme || 'light',
      compact: options.compact ?? false
    }

    this.initTools()
    this.createToolbar()
  }

  /**
   * Initialize tools configuration
   */
  private initTools(): void {
    // Selection tools
    const selectionTools: Tool[] = [
      {
        id: 'rectangle',
        type: 'selection',
        icon: '⬜',
        label: 'Rectangle',
        tooltip: 'Rectangle Selection (M)',
        group: 'selection'
      },
      {
        id: 'ellipse',
        type: 'selection',
        icon: '⭕',
        label: 'Ellipse',
        tooltip: 'Ellipse Selection (Shift+M)',
        group: 'selection'
      },
      {
        id: 'lasso',
        type: 'selection',
        icon: '✂️',
        label: 'Lasso',
        tooltip: 'Lasso Selection (L)',
        group: 'selection'
      },
      {
        id: 'polygon',
        type: 'selection',
        icon: '⬟',
        label: 'Polygon',
        tooltip: 'Polygon Selection (P)',
        group: 'selection'
      },
      {
        id: 'magic-wand',
        type: 'selection',
        icon: '✨',
        label: 'Magic Wand',
        tooltip: 'Magic Wand Selection (W)',
        group: 'selection'
      },
      {
        id: 'brush',
        type: 'selection',
        icon: '🖌️',
        label: 'Brush',
        tooltip: 'Brush Selection (B)',
        group: 'selection'
      }
    ]

    // Selection mode tools
    const modeTools: Tool[] = [
      {
        id: 'mode-new',
        type: 'action',
        icon: '🆕',
        label: 'New',
        tooltip: 'New Selection',
        group: 'mode'
      },
      {
        id: 'mode-add',
        type: 'action',
        icon: '➕',
        label: 'Add',
        tooltip: 'Add to Selection',
        group: 'mode'
      },
      {
        id: 'mode-subtract',
        type: 'action',
        icon: '➖',
        label: 'Subtract',
        tooltip: 'Subtract from Selection',
        group: 'mode'
      },
      {
        id: 'mode-intersect',
        type: 'action',
        icon: '🔄',
        label: 'Intersect',
        tooltip: 'Intersect Selection',
        group: 'mode'
      }
    ]

    // Action tools
    const actionTools: Tool[] = [
      {
        id: 'select-all',
        type: 'action',
        icon: '⬛',
        label: 'All',
        tooltip: 'Select All (Ctrl+A)'
      },
      {
        id: 'deselect',
        type: 'action',
        icon: '⬜',
        label: 'None',
        tooltip: 'Deselect (Ctrl+D)'
      },
      {
        id: 'invert',
        type: 'action',
        icon: '🔄',
        label: 'Invert',
        tooltip: 'Invert Selection (Ctrl+Shift+I)'
      },
      {
        id: 'expand',
        type: 'action',
        icon: '📐',
        label: 'Expand',
        tooltip: 'Expand Selection'
      },
      {
        id: 'contract',
        type: 'action',
        icon: '📏',
        label: 'Contract',
        tooltip: 'Contract Selection'
      }
    ]

    // Mask tools
    const maskTools: Tool[] = [
      {
        id: 'create-mask',
        type: 'mask',
        icon: '🎭',
        label: 'Create Mask',
        tooltip: 'Create Mask from Selection'
      },
      {
        id: 'quick-mask',
        type: 'mask',
        icon: '🔴',
        label: 'Quick Mask',
        tooltip: 'Toggle Quick Mask (Q)'
      },
      {
        id: 'edit-mask',
        type: 'mask',
        icon: '✏️',
        label: 'Edit',
        tooltip: 'Edit Mask'
      },
      {
        id: 'invert-mask',
        type: 'mask',
        icon: '🔃',
        label: 'Invert',
        tooltip: 'Invert Mask'
      },
      {
        id: 'refine-edge',
        type: 'mask',
        icon: '✨',
        label: 'Refine',
        tooltip: 'Refine Mask Edge'
      }
    ]

    // Add all tools to map
    [...selectionTools, ...modeTools, ...actionTools, ...maskTools].forEach(tool => {
      this.tools.set(tool.id, tool)
    })
  }

  /**
   * Create toolbar UI
   */
  private createToolbar(): void {
    // Create main toolbar container
    this.toolbar = createElement('div', {
      className: 'cropper-selection-toolbar',
      style: {
        position: 'absolute',
        zIndex: '1000',
        backgroundColor: this.options.theme === 'dark' ? '#2c3e50' : '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        padding: this.options.compact ? '4px' : '8px',
        display: 'flex',
        flexDirection: this.options.position === 'left' || this.options.position === 'right' ? 'column' : 'row',
        gap: '8px'
      }
    })

    // Position toolbar
    this.positionToolbar()

    // Create tool groups
    this.createToolGroup('selection', 'Selection Tools')
    this.createSeparator()
    this.createToolGroup('mode', 'Selection Mode')
    this.createSeparator()
    this.createActionTools()
    this.createSeparator()
    this.createMaskTools()

    // Create brush controls (hidden by default)
    this.createBrushControls()

    // Add to container
    this.container.appendChild(this.toolbar)
  }

  /**
   * Position toolbar
   */
  private positionToolbar(): void {
    if (!this.toolbar) return

    const styles: any = {}

    switch (this.options.position) {
      case 'top':
        styles.top = '10px'
        styles.left = '50%'
        styles.transform = 'translateX(-50%)'
        break
      case 'bottom':
        styles.bottom = '10px'
        styles.left = '50%'
        styles.transform = 'translateX(-50%)'
        break
      case 'left':
        styles.left = '10px'
        styles.top = '50%'
        styles.transform = 'translateY(-50%)'
        break
      case 'right':
        styles.right = '10px'
        styles.top = '50%'
        styles.transform = 'translateY(-50%)'
        break
    }

    setStyles(this.toolbar, styles)
  }

  /**
   * Create tool group
   */
  private createToolGroup(groupId: string, label: string): void {
    if (!this.toolbar) return

    const group = createElement('div', {
      className: 'tool-group',
      style: {
        display: 'flex',
        flexDirection: this.options.position === 'left' || this.options.position === 'right' ? 'column' : 'row',
        gap: '4px'
      }
    })

    // Add tools in group
    this.tools.forEach(tool => {
      if (tool.group === groupId) {
        const button = this.createToolButton(tool)
        group.appendChild(button)
        this.toolButtons.set(tool.id, button)
      }
    })

    this.toolbar.appendChild(group)
  }

  /**
   * Create action tools
   */
  private createActionTools(): void {
    if (!this.toolbar) return

    const group = createElement('div', {
      className: 'action-group',
      style: {
        display: 'flex',
        flexDirection: this.options.position === 'left' || this.options.position === 'right' ? 'column' : 'row',
        gap: '4px'
      }
    })

    const actionIds = ['select-all', 'deselect', 'invert', 'expand', 'contract']

    actionIds.forEach(id => {
      const tool = this.tools.get(id)
      if (tool) {
        const button = this.createToolButton(tool)
        group.appendChild(button)
        this.toolButtons.set(tool.id, button)
      }
    })

    this.toolbar.appendChild(group)
  }

  /**
   * Create mask tools
   */
  private createMaskTools(): void {
    if (!this.toolbar) return

    const group = createElement('div', {
      className: 'mask-group',
      style: {
        display: 'flex',
        flexDirection: this.options.position === 'left' || this.options.position === 'right' ? 'column' : 'row',
        gap: '4px'
      }
    })

    const maskIds = ['create-mask', 'quick-mask', 'edit-mask', 'invert-mask', 'refine-edge']

    maskIds.forEach(id => {
      const tool = this.tools.get(id)
      if (tool) {
        const button = this.createToolButton(tool)
        group.appendChild(button)
        this.toolButtons.set(tool.id, button)
      }
    })

    this.toolbar.appendChild(group)
  }

  /**
   * Create tool button
   */
  private createToolButton(tool: Tool): HTMLElement {
    const button = createElement('button', {
      className: 'tool-button',
      title: tool.tooltip,
      style: {
        width: this.options.compact ? '32px' : '40px',
        height: this.options.compact ? '32px' : '40px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: this.options.compact ? '16px' : '20px',
        transition: 'background-color 0.2s'
      }
    })

    button.innerHTML = tool.icon

    // Add hover effect
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = this.options.theme === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.05)'
    })

    button.addEventListener('mouseleave', () => {
      if (!tool.active) {
        button.style.backgroundColor = 'transparent'
      }
    })

    // Add click handler
    button.addEventListener('click', () => {
      this.handleToolClick(tool)
    })

    return button
  }

  /**
   * Create separator
   */
  private createSeparator(): void {
    if (!this.toolbar) return

    const separator = createElement('div', {
      className: 'toolbar-separator',
      style: {
        width: this.options.position === 'left' || this.options.position === 'right' ? '100%' : '1px',
        height: this.options.position === 'left' || this.options.position === 'right' ? '1px' : '24px',
        backgroundColor: this.options.theme === 'dark'
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.1)'
      }
    })

    this.toolbar.appendChild(separator)
  }

  /**
   * Create brush controls
   */
  private createBrushControls(): void {
    this.brushControls = createElement('div', {
      className: 'brush-controls',
      style: {
        position: 'absolute',
        top: this.options.position === 'top' ? '60px' : 'auto',
        bottom: this.options.position === 'bottom' ? '60px' : 'auto',
        left: this.options.position === 'left' ? '60px' : '50%',
        right: this.options.position === 'right' ? '60px' : 'auto',
        transform: this.options.position === 'top' || this.options.position === 'bottom' ? 'translateX(-50%)' : 'none',
        backgroundColor: this.options.theme === 'dark' ? '#2c3e50' : '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        padding: '12px',
        display: 'none',
        zIndex: '1001'
      }
    })

    // Size slider
    const sizeControl = this.createSliderControl('Size', 1, 100, 20, (value) => {
      if (this.selection) {
        this.selection.setBrushSize?.(value)
      }
      if (this.maskManager) {
        this.maskManager.setBrushSize(value)
      }
    })

    // Opacity slider
    const opacityControl = this.createSliderControl('Opacity', 0, 100, 100, (value) => {
      if (this.maskManager) {
        this.maskManager.setBrushOpacity(value)
      }
    })

    // Hardness slider
    const hardnessControl = this.createSliderControl('Hardness', 0, 100, 100, (value) => {
      if (this.maskManager) {
        this.maskManager.setBrushHardness(value)
      }
    })

    this.brushControls.appendChild(sizeControl)
    this.brushControls.appendChild(opacityControl)
    this.brushControls.appendChild(hardnessControl)

    this.container.appendChild(this.brushControls)
  }

  /**
   * Create slider control
   */
  private createSliderControl(
    label: string,
    min: number,
    max: number,
    value: number,
    onChange: (value: number) => void
  ): HTMLElement {
    const control = createElement('div', {
      className: 'slider-control',
      style: {
        marginBottom: '8px'
      }
    })

    const labelEl = createElement('label', {
      style: {
        display: 'block',
        fontSize: '12px',
        marginBottom: '4px',
        color: this.options.theme === 'dark' ? '#ecf0f1' : '#2c3e50'
      }
    })
    labelEl.textContent = label

    const slider = createElement('input', {
      type: 'range',
      min: min.toString(),
      max: max.toString(),
      value: value.toString(),
      style: {
        width: '150px'
      }
    }) as HTMLInputElement

    const valueDisplay = createElement('span', {
      style: {
        marginLeft: '8px',
        fontSize: '12px',
        color: this.options.theme === 'dark' ? '#ecf0f1' : '#2c3e50'
      }
    })
    valueDisplay.textContent = value.toString()

    slider.addEventListener('input', () => {
      const val = parseInt(slider.value)
      valueDisplay.textContent = val.toString()
      onChange(val)
    })

    control.appendChild(labelEl)
    control.appendChild(slider)
    control.appendChild(valueDisplay)

    return control
  }

  /**
   * Handle tool click
   */
  private handleToolClick(tool: Tool): void {
    switch (tool.type) {
      case 'selection':
        this.setActiveSelectionTool(tool.id as SelectionType)
        break

      case 'action':
        this.handleActionTool(tool.id)
        break

      case 'mask':
        this.handleMaskTool(tool.id)
        break
    }

    // Dispatch event
    dispatch(this.container, 'toolbar:tool:click', { tool: tool.id })
  }

  /**
   * Set active selection tool
   */
  private setActiveSelectionTool(toolId: SelectionType): void {
    // Update active state
    this.tools.forEach(tool => {
      if (tool.group === 'selection') {
        tool.active = tool.id === toolId
        const button = this.toolButtons.get(tool.id)
        if (button) {
          button.style.backgroundColor = tool.active
            ? (this.options.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)')
            : 'transparent'
        }
      }
    })

    this.activeSelectionTool = toolId

    // Update selection type
    if (this.selection) {
      this.selection.setType(toolId)
    }

    // Show/hide brush controls
    if (toolId === 'brush' && this.brushControls) {
      this.brushControls.style.display = 'block'
    } else if (this.brushControls) {
      this.brushControls.style.display = 'none'
    }
  }

  /**
   * Handle action tool
   */
  private handleActionTool(toolId: string): void {
    if (!this.selection) return

    switch (toolId) {
      case 'mode-new':
        this.selectionMode = 'new'
        this.selection.setMode('new')
        break
      case 'mode-add':
        this.selectionMode = 'add'
        this.selection.setMode('add')
        break
      case 'mode-subtract':
        this.selectionMode = 'subtract'
        this.selection.setMode('subtract')
        break
      case 'mode-intersect':
        this.selectionMode = 'intersect'
        this.selection.setMode('intersect')
        break
      case 'select-all':
        this.selection.selectAll()
        break
      case 'deselect':
        this.selection.clearSelection()
        break
      case 'invert':
        this.selection.invertSelection()
        break
      case 'expand':
        this.showExpandDialog()
        break
      case 'contract':
        this.showContractDialog()
        break
    }

    // Update mode button states
    if (toolId.startsWith('mode-')) {
      this.tools.forEach(tool => {
        if (tool.group === 'mode') {
          tool.active = tool.id === toolId
          const button = this.toolButtons.get(tool.id)
          if (button) {
            button.style.backgroundColor = tool.active
              ? (this.options.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)')
              : 'transparent'
          }
        }
      })
    }
  }

  /**
   * Handle mask tool
   */
  private handleMaskTool(toolId: string): void {
    if (!this.maskManager) return

    switch (toolId) {
      case 'create-mask':
        this.maskManager.createMaskFromSelection()
        break
      case 'quick-mask':
        this.maskManager.toggleQuickMask()
        this.updateQuickMaskButton()
        break
      case 'edit-mask':
        this.toggleMaskEditing()
        break
      case 'invert-mask':
        this.maskManager.invertMask()
        break
      case 'refine-edge':
        this.showRefineEdgeDialog()
        break
    }
  }

  /**
   * Show expand dialog
   */
  private showExpandDialog(): void {
    const pixels = prompt('Expand selection by (pixels):', '5')
    if (pixels && this.selection) {
      const value = parseInt(pixels)
      if (!isNaN(value) && value > 0) {
        this.selection.expandSelection(value)
      }
    }
  }

  /**
   * Show contract dialog
   */
  private showContractDialog(): void {
    const pixels = prompt('Contract selection by (pixels):', '5')
    if (pixels && this.selection) {
      const value = parseInt(pixels)
      if (!isNaN(value) && value > 0) {
        this.selection.contractSelection(value)
      }
    }
  }

  /**
   * Show refine edge dialog
   */
  private showRefineEdgeDialog(): void {
    // Simple implementation - in production, create a proper dialog
    const options = {
      radius: 2,
      smooth: 1,
      feather: 0,
      contrast: 0
    }

    if (this.maskManager) {
      this.maskManager.refineMaskEdge(options)
    }
  }

  /**
   * Toggle mask editing
   */
  private toggleMaskEditing(): void {
    if (!this.maskManager) return

    const tool = this.tools.get('edit-mask')
    const button = this.toolButtons.get('edit-mask')

    if (tool && button) {
      tool.active = !tool.active

      if (tool.active) {
        this.maskManager.startEditing()
        button.style.backgroundColor = this.options.theme === 'dark'
          ? 'rgba(255, 255, 255, 0.2)'
          : 'rgba(0, 0, 0, 0.1)'

        // Show brush controls
        if (this.brushControls) {
          this.brushControls.style.display = 'block'
        }
      } else {
        this.maskManager.stopEditing()
        button.style.backgroundColor = 'transparent'

        // Hide brush controls
        if (this.brushControls) {
          this.brushControls.style.display = 'none'
        }
      }
    }
  }

  /**
   * Update quick mask button
   */
  private updateQuickMaskButton(): void {
    const tool = this.tools.get('quick-mask')
    const button = this.toolButtons.get('quick-mask')

    if (tool && button) {
      // Toggle visual state based on mask visibility
      tool.active = !tool.active
      button.style.backgroundColor = tool.active
        ? (this.options.theme === 'dark' ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 0, 0, 0.2)')
        : 'transparent'
    }
  }

  /**
   * Set selection instance
   */
  setSelection(selection: Selection): void {
    this.selection = selection
  }

  /**
   * Set mask manager instance
   */
  setMaskManager(maskManager: MaskManager): void {
    this.maskManager = maskManager
  }

  /**
   * Show toolbar
   */
  show(): void {
    if (this.toolbar) {
      this.toolbar.style.display = 'flex'
    }
  }

  /**
   * Hide toolbar
   */
  hide(): void {
    if (this.toolbar) {
      this.toolbar.style.display = 'none'
    }
    if (this.brushControls) {
      this.brushControls.style.display = 'none'
    }
  }

  /**
   * Destroy toolbar
   */
  destroy(): void {
    if (this.toolbar) {
      this.container.removeChild(this.toolbar)
    }
    if (this.brushControls) {
      this.container.removeChild(this.brushControls)
    }

    this.toolButtons.clear()
    this.tools.clear()
  }
}

