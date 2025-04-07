// components/ui/custom-autocomplete.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input"; // Assuming you already have this

export function CustomAutocomplete({
    options,
    placeholder,
    onValueChange,
    inputClassName,
    dropdownClassName,
}) {
    const [search, setSearch] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState(options);
    const wrapperRef = useRef(null);

    // Filter options based on search input
    useEffect(() => {
        if (search) {
            setFilteredOptions(
                options.filter((option) =>
                    option.label.toLowerCase().includes(search.toLowerCase())
                )
            );
        } else {
            setFilteredOptions(options);
        }
    }, [search, options]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={wrapperRef} className="relative w-full">
            <Input
                placeholder={placeholder}
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className={inputClassName}
            />
            {isOpen && filteredOptions.length > 0 && (
                <div
                    className={`absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-md shadow-lg ${dropdownClassName}`}
                >
                    {filteredOptions.map((option) => (
                        <div
                            key={option.value}
                            className="cursor-pointer px-4 py-2 hover:bg-gray-700"
                            onClick={() => {
                                setSearch(option.label);
                                onValueChange(option);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
            {isOpen && filteredOptions.length === 0 && search && (
                <div
                    className={`absolute z-10 mt-1 w-full rounded-md bg-gray-800 p-2 text-gray-400 shadow-lg ${dropdownClassName}`}
                >
                    No leagues found.
                </div>
            )}
        </div>
    );
}