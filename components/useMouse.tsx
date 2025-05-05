"use client"

import { useState, useEffect } from "react"

export function useMouse() {
    const [mouse, setMouse] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMouse({ x: e.clientX, y: e.clientY })
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                setMouse({ x: e.touches[0].clientX, y: e.touches[0].clientY })
            }
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("touchmove", handleTouchMove)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("touchmove", handleTouchMove)
        }
    }, [])

    return mouse
}
