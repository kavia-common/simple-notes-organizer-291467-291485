import Blits from '@lightningjs/blits'

/**
 * Notes Home page showing a searchable notes list and an editor sidebar.
 * Ocean Professional styling with rounded corners, subtle shadows, and smooth transitions.
 */
export default Blits.Component('Home', {
  template: `
    <Element w="1920" h="1080" color="#f9fafb">
      <!-- Header -->
      <Element x="60" y="40" w="1800" h="80" :effects="[$shader('radius',{radius:16}), $shader('shadow',{color:'#00000022', blur:18, spread:0})]" color="#ffffff">
        <Text x="30" y="22" size="40" color="#111827" content="Simple Notes" />
        <Text x="320" y="30" size="24" color="#6b7280" :content="$subtitle" />
        <!-- Search box visual -->
        <Element x="1200" y="18" w="520" h="44" :effects="[$shader('radius',{radius:12})]" color="#f3f4f6">
          <Text x="16" y="8" size="24" color="#6b7280" :content="'🔎  ' + ($search || 'Search notes...')" />
        </Element>
      </Element>

      <!-- Action bar -->
      <Element x="60" y="140" w="1800" h="60">
        <Element x="0" y="0" w="160" h="60" :effects="[$shader('radius',{radius:14}), $shader('shadow',{color:'#2563EB33', blur:16})]" :color="$canEdit ? '#2563EB' : '#93c5fd'">
          <Text x="24" y="16" size="28" color="#ffffff" content="New (N)" />
        </Element>
        <Element x="180" y="0" w="160" h="60" :effects="[$shader('radius',{radius:14})]" :alpha="$canEdit ? 1 : .5" color="#2563EB">
          <Text x="24" y="16" size="28" color="#ffffff" content="Save (S)" />
        </Element>
        <Element x="360" y="0" w="180" h="60" :effects="[$shader('radius',{radius:14})]" :alpha="$hasSelection ? 1 : .5" color="#EF4444">
          <Text x="24" y="16" size="28" color="#ffffff" content="Delete (Del)" />
        </Element>
        <Element x="560" y="0" w="220" h="60" :effects="[$shader('radius',{radius:14})]" color="#F59E0B">
          <Text x="24" y="16" size="28" color="#111827" content="Sort: : $sortLabel" />
        </Element>
      </Element>

      <!-- Main content area -->
      <Element x="60" y="220" w="1800" h="820" color="#00000000">
        <!-- Notes list -->
        <Element x="0" y="0" w="900" h="820" :effects="[$shader('radius',{radius:18}), $shader('shadow',{color:'#0000001a', blur:20})]" color="#ffffff">
          <!-- List header -->
          <Element x="0" y="0" w="900" h="70" color="#f3f4f6">
            <Text x="24" y="18" size="30" color="#111827" content="Notes" />
            <Text x="820" y="20" size="22" color="#6b7280" :content="'' + $notes.length" mount="{x:1}" />
          </Element>

          <!-- Search field indicator -->
          <Element x="20" y="84" w="860" h="46" :effects="[$shader('radius',{radius:12})]" color="#f9fafb">
            <Text x="16" y="10" size="24" color="#6b7280" :content="'Filter: ' + ($search || 'type to filter (F)')" />
          </Element>

          <!-- Scrollable list area -->
          <Element x="0" y="140" w="900" h="660" color="#00000000">
            <Element
              :for="(item, idx) in $filtered"
              :key="$item.id"
              :y="$index * 110"
              x="20"
              w="860"
              h="100"
              :effects="[$shader('radius',{radius:14}), $shader('shadow',{color: $selectedId === $item.id ? '#2563EB33' : '#00000010', blur:14})]"
              :color="$selectedId === $item.id ? '#dbeafe' : '#ffffff'"
            >
              <Element x="0" y="0" w="10" h="100" :color="$selectedId === $item.id ? '#2563EB' : '#00000000'" />
              <Text x="24" y="16" size="28" color="#111827" :content="$item.title || 'Untitled'" />
              <Text x="24" y="56" size="22" color="#6b7280" :content="$item.snippet" />
              <Text x="800" y="16" size="20" mount="{x:1}" color="#6b7280" :content="$item.updatedAtLabel" />
            </Element>
          </Element>
        </Element>

        <!-- Editor sidebar -->
        <Element x="920" y="0" w="880" h="820" :effects="[$shader('radius',{radius:18}), $shader('shadow',{color:'#0000001a', blur:20})]" color="#ffffff">
          <Element x="0" y="0" w="880" h="70" color="#f3f4f6">
            <Text x="24" y="18" size="30" color="#111827" :content="$editorTitle" />
          </Element>

          <!-- Title input (visual) -->
          <Element x="24" y="96" w="832" h="56" :effects="[$shader('radius',{radius:12})]" color="#f9fafb">
            <Text x="16" y="12" size="26" color="#111827" :content="'Title: ' + $draft.title" />
          </Element>

          <!-- Content input (visual multi-line) -->
          <Element x="24" y="168" w="832" h="560" :effects="[$shader('radius',{radius:16})]" color="#f9fafb">
            <Text x="16" y="16" size="24" color="#111827" :content="$draftPreview" lineheight="34" maxwidth="800" />
          </Element>

          <Element x="24" y="744" w="832" h="56" color="#00000000">
            <Text x="0" y="8" size="22" color="#6b7280" :content="$status" />
            <Text x="832" y="8" size="22" color="#6b7280" mount="{x:1}" :content="$help" />
          </Element>
        </Element>
      </Element>

      <!-- Snackbar -->
      <Element x="960" y="1000" w="600" h="56" mount="{x:.5}" :alpha.transition="{value:$toast.alpha, duration:200}" :effects="[$shader('radius',{radius:14}), $shader('shadow',{color:'#00000026', blur:16})]" :color="$toast.color">
        <Text x="20" y="12" size="24" color="#ffffff" :content="$toast.message" />
      </Element>
    </Element>
  `,
  state() {
    return {
      // Notes data
      notes: [],
      selectedId: null,
      // UI state
      search: '',
      sort: 'updated', // 'updated' | 'az'
      mode: 'view', // 'view' | 'edit' | 'new' | 'search'
      // Draft for editor
      draft: { id: null, title: '', content: '' },
      // Toast
      toast: { alpha: 0, message: '', color: '#2563EB' },
    }
  },
  computed: {
    subtitle() {
      return 'Ocean Professional • Clean, modern notes'
    },
    hasSelection() {
      return !!this.selectedId
    },
    canEdit() {
      return this.mode === 'edit' || this.mode === 'new'
    },
    editorTitle() {
      if (this.mode === 'new') return 'Create Note'
      if (this.mode === 'edit') return 'Edit Note'
      if (!this.selectedId) return 'No note selected'
      const n = this.notes.find(n => n.id === this.selectedId)
      return n ? 'Viewing: ' + (n.title || 'Untitled') : 'No note selected'
    },
    draftPreview() {
      return (this.draft.content || '').slice(0, 300)
    },
    sortLabel() {
      return this.sort === 'updated' ? 'Last Updated' : 'A–Z'
    },
    filtered() {
      const q = (this.search || '').toLowerCase()
      let arr = this.notes.map(n => ({
        ...n,
        snippet: (n.content || '').slice(0, 60).replace(/\\n/g, ' '),
        updatedAtLabel: this.$formatTime(n.updatedAt),
      }))
      if (q) {
        arr = arr.filter(n => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q))
      }
      if (this.sort === 'az') {
        arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
      } else {
        arr.sort((a, b) => b.updatedAt - a.updatedAt)
      }
      return arr
    },
    status() {
      if (this.mode === 'search') return 'Filtering… type to refine, Enter to clear'
      if (this.mode === 'new') return 'Editing new note — Save (S) or Back (Esc) to cancel'
      if (this.mode === 'edit') return 'Editing — Save (S) to apply or Back (Esc) to discard changes'
      return 'Navigate: Up/Down • Open/Edit: Enter • New: N • Delete: Del • Filter: F'
    },
    help() {
      return 'Keys: N New • S Save • F Filter • Del Delete • A-Z Sort • Enter Edit'
    },
  },
  hooks: {
    ready() {
      // Seed with sample notes
      this.notes = [
        this.$makeNote('Welcome', 'This is your notes app built with Lightning 3 (Blits).\\nCreate, edit, and delete notes.'),
        this.$makeNote('Ocean Theme', 'Primary: #2563EB, Secondary: #F59E0B.\\nClean, modern cards with subtle shadows.'),
        this.$makeNote('Shortcuts', 'N = New, S = Save, Del = Delete, F = Filter, Enter = Edit/Select.'),
      ]
      this.selectedId = this.notes[0].id
      this.$showToast('Ready', '#2563EB')
    },
    focus() {
      // nothing special; keyboard handled via input
    },
  },
  methods: {
    // PUBLIC_INTERFACE
    $formatTime(ts) {
      /** Format timestamp to relative-like short label */
      const d = new Date(ts)
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    // PUBLIC_INTERFACE
    $makeNote(title, content) {
      /** Create a new note object */
      return { id: this.$uid(), title: title || '', content: content || '', updatedAt: Date.now() }
    },
    // PUBLIC_INTERFACE
    $uid() {
      /** Simple unique id */
      return Math.random().toString(36).slice(2) + Date.now().toString(36)
    },
    // PUBLIC_INTERFACE
    $selectById(id) {
      /** Select note and load into draft (view mode) */
      this.selectedId = id
      const n = this.notes.find(n => n.id === id)
      if (n) this.draft = { ...n }
      this.mode = 'view'
    },
    // PUBLIC_INTERFACE
    $newNote() {
      /** Switch to new note mode */
      this.mode = 'new'
      this.draft = { id: null, title: '', content: '' }
    },
    // PUBLIC_INTERFACE
    $editSelected() {
      /** Enter edit mode for selected note */
      if (!this.selectedId) return
      const n = this.notes.find(n => n.id === this.selectedId)
      if (!n) return
      this.mode = 'edit'
      this.draft = { ...n }
    },
    // PUBLIC_INTERFACE
    $saveDraft() {
      /** Validate and save draft */
      const title = (this.draft.title || '').trim()
      if (!title) {
        this.$showToast('Title required', '#EF4444')
        return
      }
      if (this.mode === 'new') {
        const note = this.$makeNote(title, this.draft.content || '')
        this.notes = [note, ...this.notes]
        this.selectedId = note.id
        this.$showToast('Note created', '#2563EB')
      } else if (this.mode === 'edit') {
        const idx = this.notes.findIndex(n => n.id === this.draft.id)
        if (idx >= 0) {
          const updated = { ...this.draft, updatedAt: Date.now() }
          const arr = [...this.notes]
          arr[idx] = updated
          this.notes = arr
          this.selectedId = updated.id
          this.$showToast('Saved', '#2563EB')
        }
      }
      this.mode = 'view'
    },
    // PUBLIC_INTERFACE
    $deleteSelected() {
      /** Delete with confirm and toast with undo support */
      if (!this.selectedId) return
      const idx = this.notes.findIndex(n => n.id === this.selectedId)
      if (idx < 0) return
      const removed = this.notes[idx]
      // optimistic remove
      const arr = [...this.notes]
      arr.splice(idx, 1)
      this.notes = arr
      this.selectedId = this.notes[0]?.id || null
      this.$showToast('Deleted — press U to undo', '#EF4444')
      // store for undo
      this._lastDeleted = removed
      this._undoTimer && this.$clearTimeout(this._undoTimer)
      this._undoTimer = this.$setTimeout(() => {
        this._lastDeleted = null
      }, 4000)
    },
    // PUBLIC_INTERFACE
    $undoDelete() {
      /** Undo last delete within window */
      if (!this._lastDeleted) return
      this.notes = [this._lastDeleted, ...this.notes]
      this.selectedId = this._lastDeleted.id
      this._lastDeleted = null
      this.$showToast('Restored', '#2563EB')
    },
    // PUBLIC_INTERFACE
    $cycleSort() {
      /** Toggle sorting mode */
      this.sort = this.sort === 'updated' ? 'az' : 'updated'
    },
    // PUBLIC_INTERFACE
    $showToast(message, color) {
      /** Show snackbar/toast */
      this.toast = { alpha: 1, message, color: color || '#2563EB' }
      this._toastTimer && this.$clearTimeout(this._toastTimer)
      this._toastTimer = this.$setTimeout(() => {
        this.toast = { ...this.toast, alpha: 0 }
      }, 1800)
    },
    // PUBLIC_INTERFACE
    $moveSelection(delta) {
      /** Move selection up/down in filtered results */
      const list = this.filtered
      if (!list.length) return
      const idx = Math.max(
        0,
        Math.min(
          list.length - 1,
          Math.max(
            0,
            this.selectedId ? list.findIndex(n => n.id === this.selectedId) : 0,
          ) + delta,
        ),
      )
      const next = list[idx]
      if (next) this.$selectById(next.id)
    },
    // PUBLIC_INTERFACE
    $startFilter() {
      /** Enter search mode (visual only) */
      this.mode = 'search'
    },
    // PUBLIC_INTERFACE
    $clearFilter() {
      /** Clear search */
      this.search = ''
      this.mode = 'view'
    },
    // PUBLIC_INTERFACE
    $typeIn(field, ch) {
      /** Add character to field (title|content|search) */
      if (field === 'search') {
        this.search = (this.search || '') + ch
        return
      }
      if (field === 'title') {
        this.draft = { ...this.draft, title: (this.draft.title || '') + ch }
        return
      }
      if (field === 'content') {
        this.draft = { ...this.draft, content: (this.draft.content || '') + ch }
      }
    },
    // PUBLIC_INTERFACE
    $backspace(field) {
      /** Remove last character from field */
      const pop = s => (s || '').slice(0, -1)
      if (field === 'search') {
        this.search = pop(this.search)
        return
      }
      if (field === 'title') {
        this.draft = { ...this.draft, title: pop(this.draft.title) }
        return
      }
      if (field === 'content') {
        this.draft = { ...this.draft, content: pop(this.draft.content) }
      }
    },
  },
  input: {
    up() {
      this.$moveSelection(-1)
    },
    down() {
      this.$moveSelection(1)
    },
    left() {
      // no-op for now
    },
    right() {
      // no-op for now
    },
    enter() {
      if (!this.selectedId && this.filtered[0]) {
        this.$selectById(this.filtered[0].id)
        return
      }
      if (this.mode === 'view' && this.selectedId) {
        this.$editSelected()
        return
      }
      if (this.mode === 'search') {
        // clear search and back to view
        this.$clearFilter()
      }
    },
    back() {
      if (this.mode === 'edit' || this.mode === 'new' || this.mode === 'search') {
        this.mode = 'view'
        return
      }
      // default back: clear selection
      this.selectedId = null
    },
    // Text input simulation for Lightning: capture printable keys via keyCode if provided
    // For this scaffold, we'll handle a minimal subset using the 'key' on event when available.
    keypress(e) {
      const k = e?.key
      if (!k) return
      if (k.length === 1) {
        if (this.mode === 'search') this.$typeIn('search', k)
        else if (this.mode === 'edit' || this.mode === 'new') {
          // rudimentary focus: first fill title until newline then content
          if (k === '\\n') this.$typeIn('content', '\\n')
          else if ((this.draft.title || '').length < 40) this.$typeIn('title', k)
          else this.$typeIn('content', k)
        }
      } else if (k === 'Backspace') {
        if (this.mode === 'search') this.$backspace('search')
        else if (this.mode === 'edit' || this.mode === 'new') this.$backspace('content')
      }
    },
    // Convenience hotkeys
    n() {
      this.$newNote()
    },
    s() {
      if (this.mode === 'edit' || this.mode === 'new') this.$saveDraft()
    },
    f() {
      this.$startFilter()
    },
    u() {
      this.$undoDelete()
    },
    a() {
      this.$cycleSort()
    },
    delete() {
      this.$deleteSelected()
    },
  },
})
