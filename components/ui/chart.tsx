"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

// Type for chart payload items
interface ChartPayloadItem {
  value?: any
  name?: string
  dataKey?: string | number
  payload?: any
  color?: string
  fill?: string
  [key: string]: any
}

// Type for chart config items
interface ChartConfigItem {
  label?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  color?: string
  theme?: Record<keyof typeof THEMES, string>
}

// Type for chart config
type ChartConfig = Record<string, ChartConfigItem>

// Type for chart context props
interface ChartContextProps {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
    children: React.ReactNode
  }
>(({ className, children, config, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative w-full h-[350px] overflow-hidden", className)}
      {...props}
    >
      <ChartStyle id={React.useId()} config={config} />
      <ChartContext.Provider value={{ config }}>
        {children}
      </ChartContext.Provider>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartStyle: React.FC<{ id: string; config: ChartConfig }> = ({ id, config }) => {
  return (
    <style>
      {Object.entries(config).map(([key, item]) => {
        const color = item.color || (item.theme ? item.theme.light : "")
        const darkColor = item.theme?.dark || ""
        
        return `
          ${color ? `[data-chart-style~="${id}"] .recharts-${key} .recharts-surface` : ''} {
            ${color ? `--chart-${key}: ${color} !important;` : ""}
          }
          ${darkColor ? `.dark [data-chart-style~="${id}"] .recharts-${key} .recharts-surface` : ''} {
            ${darkColor ? `--chart-${key}: ${darkColor} !important;` : ""}
          }
        `
      })}
    </style>
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

interface TooltipPayloadItem extends ChartPayloadItem {
  dataKey: string | number
  value: any
  name: string
  payload: any
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<typeof RechartsPrimitive.Tooltip>, 'content'> &
    React.HTMLAttributes<HTMLDivElement> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
      label?: string | number | React.ReactNode
      labelFormatter?: (value: any, payload: TooltipPayloadItem[]) => React.ReactNode
      formatter?: (
        value: any,
        name: string,
        item: TooltipPayloadItem,
        index: number,
        payload: any
      ) => React.ReactNode
      active?: boolean
      payload?: TooltipPayloadItem[]
    }
>(
  ({
    active,
    payload = [],
    className,
    label,
    labelKey,
    nameKey,
    hideLabel = false,
    hideIndicator = false,
    indicator = "dot",
    color,
    labelFormatter,
    formatter,
    ...props
  }, ref) => {
    const { config } = useChart()
    const nestLabel = !hideLabel && (label || labelKey)
    
    let tooltipLabel: React.ReactNode = null
    
    if (nestLabel) {
      if (labelFormatter) {
        tooltipLabel = labelFormatter(label, payload)
      } else if (label !== undefined) {
        tooltipLabel = label
      } else if (labelKey && payload?.[0]?.payload) {
        tooltipLabel = payload[0].payload[labelKey]
      }
    }

    if (!active || !payload?.length) return null

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-background p-4 text-sm shadow-sm",
          className
        )}
        {...props}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item: TooltipPayloadItem, index: number) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload?.fill || item.color

            return (
              <div
                key={item.dataKey || index}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-2">
                  {!hideIndicator && (
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        indicator === "dashed" && "h-0.5 w-3",
                        indicator === "line" && "h-0.5 w-3"
                      )}
                      style={{
                        backgroundColor: indicatorColor,
                      }}
                    />
                  )}
                  <span className="text-muted-foreground">
                    {itemConfig?.label || item.name || key}
                  </span>
                </div>
                <span className="font-medium text-foreground">
                  {formatter
                    ? formatter(item.value, item.name, item, index, payload)
                    : item.value}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
): { label?: React.ReactNode; icon?: React.ComponentType<{ className?: string }> } | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined
  }

  const payloadObj = payload as Record<string, unknown>
  const dataKey = payloadObj.dataKey as string | undefined
  
  if (!dataKey) return undefined
  
  const configItem = config[dataKey]
  if (!configItem) return undefined
  
  return {
    label: configItem.label,
    icon: configItem.icon,
  }
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  useChart,
  type ChartConfig,
  type ChartPayloadItem,
}
