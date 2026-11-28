import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/** Thin wrapper over the native <dialog>: gives us focus trap, Esc to close and a backdrop for free. */
export function Dialog({ open, title, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby="dialog-title"
      onClose={onClose}
      onClick={e => { if (e.target === ref.current) onClose() }}
    >
      {open && (
        <div className="dialog-body">
          <h2 id="dialog-title">{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  )
}
