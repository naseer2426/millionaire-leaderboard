import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextValue {
    value: string
    onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined)

interface TabsProps {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
    className?: string
    queryParam?: string
}

function Tabs({ defaultValue, value: controlledValue, onValueChange, children, className, queryParam = "tab" }: TabsProps) {
    // Get initial value from URL query param or use defaultValue
    const getInitialValue = React.useCallback(() => {
        const params = new URLSearchParams(window.location.search)
        const urlValue = params.get(queryParam)
        return urlValue || defaultValue || ""
    }, [defaultValue, queryParam])

    const [internalValue, setInternalValue] = React.useState(() => {
        const params = new URLSearchParams(window.location.search)
        const urlValue = params.get(queryParam)
        return urlValue || defaultValue || ""
    })
    const isControlled = controlledValue !== undefined
    const currentValue = isControlled ? controlledValue : internalValue

    // Sync with URL query param on mount and when URL changes
    React.useEffect(() => {
        const handlePopState = () => {
            const newValue = getInitialValue()
            if (!isControlled && newValue !== internalValue) {
                setInternalValue(newValue)
            }
        }

        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [isControlled, internalValue, getInitialValue])

    const handleValueChange = React.useCallback((newValue: string) => {
        // Update URL query parameter
        const params = new URLSearchParams(window.location.search)
        if (newValue) {
            params.set(queryParam, newValue)
        } else {
            params.delete(queryParam)
        }

        const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
        window.history.pushState({}, '', newUrl)

        if (!isControlled) {
            setInternalValue(newValue)
        }
        onValueChange?.(newValue)
    }, [isControlled, onValueChange, queryParam])

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
            <div className={cn("w-full", className)}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

interface TabsListProps {
    children: React.ReactNode
    className?: string
}

function TabsList({ children, className }: TabsListProps) {
    return (
        <div
            className={cn(
                "inline-flex h-10 items-center justify-center rounded-md bg-gray-800 p-1 text-gray-400",
                className
            )}
        >
            {children}
        </div>
    )
}

interface TabsTriggerProps {
    value: string
    children: React.ReactNode
    className?: string
    variant?: 'default' | 'danger'
}

function TabsTrigger({ value, children, className, variant = 'default' }: TabsTriggerProps) {
    const context = React.useContext(TabsContext)
    if (!context) {
        throw new Error("TabsTrigger must be used within Tabs")
    }

    const isActive = context.value === value

    const variantStyles = variant === 'danger'
        ? isActive
            ? "bg-red-700 text-gray-100 shadow-sm"
            : "text-red-400 hover:bg-red-700/50 hover:text-red-300"
        : isActive
            ? "bg-gray-700 text-gray-100 shadow-sm"
            : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-300"

    return (
        <button
            type="button"
            onClick={() => context.onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                variantStyles,
                className
            )}
        >
            {children}
        </button>
    )
}

interface TabsContentProps {
    value: string
    children: React.ReactNode
    className?: string
}

function TabsContent({ value, children, className }: TabsContentProps) {
    const context = React.useContext(TabsContext)
    if (!context) {
        throw new Error("TabsContent must be used within Tabs")
    }

    if (context.value !== value) {
        return null
    }

    return (
        <div
            className={cn(
                "mt-2 ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
                className
            )}
        >
            {children}
        </div>
    )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

