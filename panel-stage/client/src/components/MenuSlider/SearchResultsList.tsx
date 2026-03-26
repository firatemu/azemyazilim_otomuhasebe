import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Chip,
    Stack,
    IconButton,
    Collapse,
    Paper,
} from '@mui/material';
import {
    KeyboardArrowDown,
    KeyboardArrowUp,
} from '@mui/icons-material';
import { MenuItem } from './types';
import { getIconComponent } from './utils';

interface SearchResult {
    item: MenuItem;
    type: 'main' | 'sub';
    parentItem?: MenuItem;
}

interface SearchResultsListProps {
    results: SearchResult[];
    searchTerm: string;
    onItemClick: (item: MenuItem) => void;
}

export default function SearchResultsList({
    results,
    onItemClick,
}: SearchResultsListProps) {
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // Filter to show ONLY sub-items, exclude main menu items
    const subItemResults = useMemo(() => {
        return results.filter((result) => result.type === 'sub');
    }, [results]);

    // Group sub-items by their parent category
    const groupedResults = useMemo(() => {
        const grouped: Record<string, { parentItem: MenuItem; items: SearchResult[] }> = {};

        subItemResults.forEach((result) => {
            const parentItem = result.parentItem!;
            const parentKey = parentItem.id;

            if (!grouped[parentKey]) {
                grouped[parentKey] = {
                    parentItem,
                    items: []
                };
            }

            grouped[parentKey].items.push(result);
        });

        return grouped;
    }, [subItemResults]);

    const toggleGroup = (groupKey: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupKey]: prev[groupKey] === false ? true : false // default to expanded (true)
        }));
    };

    const isExpanded = (groupKey: string) => expandedGroups[groupKey] !== false;

    return (
        <Box sx={{ width: '100%', maxWidth: '900px', mx: 'auto', mt: 4 }}>
            <Typography sx={{ color: '#475569', fontSize: '1rem', fontWeight: 600, mb: 3 }}>
                "{subItemResults.length} sonuç bulundu"
            </Typography>

            {Object.entries(groupedResults).map(([groupKey, group]) => {
                const ParentIcon = getIconComponent(group.parentItem.icon);

                return (
                    <Box key={groupKey} sx={{ mb: 3 }}>
                        {/* Parent Category Header */}
                        <Paper
                            onClick={() => toggleGroup(groupKey)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 2,
                                bgcolor: 'rgba(255, 255, 255, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.8)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                backdropFilter: 'blur(12px)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                                    transform: 'translateY(-2px)',
                                    border: '1px solid rgba(255, 255, 255, 0.9)',
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '10px',
                                        bgcolor: group.parentItem.color || '#6366f1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <ParentIcon sx={{ fontSize: 28, color: '#FFFFFF' }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1E293B' }}>
                                        {group.parentItem.label}
                                    </Typography>
                                    <Typography sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                                        {group.items.length} sonuç
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton size="small" sx={{ color: '#64748B' }}>
                                {isExpanded(groupKey) ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            </IconButton>
                        </Paper>

                        {/* Group Items List */}
                        <Collapse in={isExpanded(groupKey)}>
                            <Stack spacing={1.5} sx={{ mt: 2 }}>
                                {group.items.map((result, idx) => {
                                    const IconComponent = getIconComponent(result.item.icon);

                                    return (
                                        <Box
                                            key={`${groupKey}-${idx}`}
                                            onClick={() => onItemClick(result.item)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: 2,
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                bgcolor: 'rgba(255, 255, 255, 0.4)',
                                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                                marginLeft: '24px', // Indent all items (sub-items)
                                                '&:hover': {
                                                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                                                    transform: 'translateX(4px)',
                                                    border: '1px solid rgba(255, 255, 255, 0.8)',
                                                }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: '8px',
                                                    bgcolor: result.item.color || group.parentItem.color || '#6366f1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: 2,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <IconComponent sx={{ fontSize: 22, color: '#FFFFFF' }} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ color: '#1E293B', fontWeight: 600, fontSize: '1rem' }}>
                                                    {result.item.label}
                                                </Typography>
                                                <Typography sx={{ color: '#64748B', fontSize: '0.85rem' }}>
                                                    {group.parentItem.label}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Stack>
                        </Collapse>
                    </Box>
                );
            })}

            {subItemResults.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography sx={{ color: '#64748B', fontSize: '1rem' }}>
                        Sonuç bulunamadı
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
