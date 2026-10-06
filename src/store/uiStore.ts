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

    openCart: () => set({ isCartOpen: true, isMobileMenuOpen: false }),
    closeCart: () => set({ isCartOpen: false }),
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen, isMobileMenuOpen: false })),

    openMobileMenu: () => set({ isMobileMenuOpen: true, isCartOpen: false }),
    closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    toggleMobileMenu: () =>
        set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen, isCartOpen: false })),

    closeAll: () => set({ isCartOpen: false, isMobileMenuOpen: false }),
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

export function useCartPulse(): number {
    return useUiStore((state) => state.cartPulse)
}
