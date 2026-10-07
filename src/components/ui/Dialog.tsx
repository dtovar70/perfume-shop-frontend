import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'

import { useModalPresence } from '@/store/uiStore'
import { cn } from '@/utils/cn'
import { useLockBodyScroll } from '@/utils/hooks/useLockBodyScroll'

export interface DialogProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'children'> {
    isOpen: boolean
    onClose: () => void
    /** Id of the element that names the dialog (its heading). */
    labelledBy?: string
    children: ReactNode
}

/**
 * A modal on the native `<dialog>`: `showModal()` makes the page behind inert (focus stays
 * inside), Escape and a click on the backdrop close it, the page does not scroll behind it and
 * focus goes back to whatever opened it. Sizing and layout belong to the caller (`className`).
 */
export function Dialog({ isOpen, onClose, labelledBy, className, children, ...rest }: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useLockBodyScroll(isOpen)
    useModalPresence(isOpen)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog || !isOpen) return
        const opener = document.activeElement
        if (!dialog.open) dialog.showModal()
        return () => {
            if (dialog.open) dialog.close()
            // Also when the dialog unmounts while open (its host closed it by unmounting).
            if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
        }
    }, [isOpen])

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={labelledBy}
            onCancel={(event) => {
                // Escape: React owns the open state.
                event.preventDefault()
                onClose()
            }}
            onClick={(event) => {
                // A click on the element itself (not its content) is a click on the backdrop.
                if (event.target === event.currentTarget) onClose()
            }}
            className={cn(
                'overflow-hidden border-line bg-surface p-0 text-fg shadow-lift backdrop:bg-scrim backdrop:backdrop-blur-sm',
                className,
            )}
            {...rest}
        >
            {isOpen ? children : null}
        </dialog>
    )
}
