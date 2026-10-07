import { useEffect } from 'react'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

interface UiState {
    isCartOpen: boolean
    isMobileMenuOpen: boolean
    /**
     * Bumped each time something lands in the cart (after the fly-to-cart flight, or right away
     * with reduced motion); the header cart button bounces and pops its badge on every change.
     */
    cartPulse: number
    pulseCart: () => void
    /** Slug of the product shown in the quick view dialog; null when it is closed. */
    quickViewSlug: string | null
    openQuickView: (slug: string) => void
    closeQuickView: () => void
    /** The product page's phone sticky add-to-cart bar is on screen (floating buttons clear it). */
    isStickyBarVisible: boolean
    setStickyBarVisible: (isVisible: boolean) => void
    /** Modal dialogs open right now (see `useModalPresence`). */
    openModalCount: number
    /** Counts one more open modal; the returned function releases it. */
    registerModal: () => () => void
    openCart: () => void
    closeCart: () => void
    toggleCart: () => void
    openMobileMenu: () => void
    closeMobileMenu: () => void
    toggleMobileMenu: () => void
    closeAll: () => void
}

export const useUiStore = create<UiState>()((set) => ({
    isCartOpen: false,
    isMobileMenuOpen: false,
    cartPulse: 0,

    pulseCart: () => set((state) => ({ cartPulse: state.cartPulse + 1 })),

    quickViewSlug: null,
    openQuickView: (slug) =>
        set({ quickViewSlug: slug, isCartOpen: false, isMobileMenuOpen: false }),
    closeQuickView: () => set({ quickViewSlug: null }),

    isStickyBarVisible: false,
    setStickyBarVisible: (isVisible) => set({ isStickyBarVisible: isVisible }),

    openModalCount: 0,
    registerModal: () => {
        set((state) => ({ openModalCount: state.openModalCount + 1 }))
        let isReleased = false
        return () => {
            if (isReleased) return
            isReleased = true
            set((state) => ({ openModalCount: Math.max(0, state.openModalCount - 1) }))
        }
    },

    openCart: () => set({ isCartOpen: true, isMobileMenuOpen: false }),
    closeCart: () => set({ isCartOpen: false }),
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen, isMobileMenuOpen: false })),

    openMobileMenu: () => set({ isMobileMenuOpen: true, isCartOpen: false }),
    closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen, isCartOpen: false })),

    closeAll: () => set({ isCartOpen: false, isMobileMenuOpen: false, quickViewSlug: null }),
}))

export function useCartDrawer() {
    return useUiStore(
        useShallow((state) => ({
            isOpen: state.isCartOpen,
            open: state.openCart,
            close: state.closeCart,
            toggle: state.toggleCart,
        })),
    )
}

export function useMobileMenu() {
    return useUiStore(
        useShallow((state) => ({
            isOpen: state.isMobileMenuOpen,
            open: state.openMobileMenu,
            close: state.closeMobileMenu,
            toggle: state.toggleMobileMenu,
        })),
    )
}

export function useQuickView() {
    return useUiStore(
        useShallow((state) => ({
            slug: state.quickViewSlug,
            open: state.openQuickView,
            close: state.closeQuickView,
        })),
    )
}

/** Any overlay that covers the page: cart drawer, mobile menu, quick view or another modal. */
export function useIsOverlayOpen(): boolean {
    return useUiStore(
        (state) =>
            state.isCartOpen ||
            state.isMobileMenuOpen ||
            state.quickViewSlug !== null ||
            state.openModalCount > 0,
    )
}

/** Registers a modal as open while `isOpen` is true, so floating buttons step aside. */
export function useModalPresence(isOpen: boolean): void {
    const registerModal = useUiStore((state) => state.registerModal)
    useEffect(() => (isOpen ? registerModal() : undefined), [isOpen, registerModal])
}

export function useCartPulse(): number {
    return useUiStore((state) => state.cartPulse)
}
