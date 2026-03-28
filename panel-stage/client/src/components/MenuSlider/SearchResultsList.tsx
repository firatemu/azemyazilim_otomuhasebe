import React, { useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Chip,
    Stack,
    IconButton,
    Collapse,
    Paper,
    useTheme,
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
    const theme = useTheme();
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // Show all results (both main and sub-items)
    const allResults = results;

    // Group results by their parent category
    const groupedResults = useMemo(() => {
        const grouped: Record<string, { parentItem: MenuItem; items: SearchResult[] }> = {};

        allResults.forEach((result) => {
            // For main menu items, use themselves as parent
            const parentItem = result.parentItem || result.item;
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
    }, [allResults]);

    const toggleGroup = (groupKey: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupKey]: prev[groupKey] === false ? true : false // default to expanded (true)
        }));
    };

    const isExpanded = (groupKey: string) => expandedGroups[groupKey] !== false;

    return (
        <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: '900px' }, mx: 'auto', mt: { xs: 2, sm: 3, md: 4 } }}>
            <Typography sx={{ color: theme.palette.mode === 'light' ? '#475569' : '#CBD5E1', fontSize: { xs: '0.9rem', sm: '1rem' }, fontWeight: 600, mb: { xs: 2, sm: 3 } }}>
                {allResults.length} sonuç bulundu
            </Typography>

            {Object.entries(groupedResults).map(([groupKey, group]) => {
                const ParentIcon = getIconComponent(group.parentItem.icon);

                return (
                    <Box key={groupKey} sx={{ mb: { xs: 2, sm: 3 } }}>
                        {/* Parent Category Header */}
                        <Paper
                            onClick={() => toggleGroup(groupKey)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: { xs: 1.5, sm: 2 },
                                bgcolor: theme.palette.mode === 'light'
                                    ? 'rgba(255, 255, 255, 0.6)'
                                    : 'rgba(30, 41, 59, 0.6)',
                                border: theme.palette.mode === 'light'
                                    ? '1px solid rgba(255, 255, 255, 0.8)'
                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                backdropFilter: 'blur(12px)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: theme.palette.mode === 'light'
                                        ? 'rgba(255, 255, 255, 0.8)'
                                        : 'rgba(30, 41, 59, 0.8)',
                                    transform: 'translateY(-2px)',
                                    border: theme.palette.mode === 'light'
                                        ? '1px solid rgba(255, 255, 255, 0.9)'
                                        : '1px solid rgba(255, 255, 255, 0.15)',
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                                <Box
                                    sx={{
                                        width: { xs: 40, sm: 48 },
                                        height: { xs: 40, sm: 48 },
                                        borderRadius: '10px',
                                        bgcolor: group.parentItem.color || '#6366f1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <ParentIcon sx={{ fontSize: { xs: 22, sm: 28 }, color: '#FFFFFF' }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.1rem' }, color: theme.palette.mode === 'light' ? '#1E293B' : '#F1F5F9' }}>
                                        {group.parentItem.label}
                                    </Typography>
                                    <Typography sx={{ color: theme.palette.mode === 'light' ? '#64748B' : '#94A3B8', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                                        {group.items.length} sonuç
                                    </Typography>
                                </Box>
                            </Box>
                            <IconButton size="small" sx={{ color: theme.palette.mode === 'light' ? '#64748B' : '#94A3B8' }}>
                                {isExpanded(groupKey) ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                            </IconButton>
                        </Paper>

                        {/* Group Items List */}
                        <Collapse in={isExpanded(groupKey)}>
                            <Stack spacing={{ xs: 1, sm: 1.5 }} sx={{ mt: { xs: 1.5, sm: 2 } }}>
                                {group.items.map((result, idx) => {
                                    const IconComponent = getIconComponent(result.item.icon);

                                    return (
                                        <Box
                                            key={`${groupKey}-${idx}`}
                                            onClick={() => onItemClick(result.item)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: { xs: 1.5, sm: 2 },
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                bgcolor: theme.palette.mode === 'light'
                                                    ? 'rgba(255, 255, 255, 0.4)'
                                                    : 'rgba(30, 41, 59, 0.4)',
                                                border: theme.palette.mode === 'light'
                                                    ? '1px solid rgba(255, 255, 255, 0.5)'
                                                    : '1px solid rgba(255, 255, 255, 0.1)',
                                                marginLeft: { xs: '16px', sm: '24px' }, // Indent all items (sub-items)
                                                '&:hover': {
                                                    bgcolor: theme.palette.mode === 'light'
                                                        ? 'rgba(255, 255, 255, 0.7)'
                                                        : 'rgba(30, 41, 59, 0.6)',
                                                    transform: 'translateX(4px)',
                                                    border: theme.palette.mode === 'light'
                                                        ? '1px solid rgba(255, 255, 255, 0.8)'
                                                        : '1px solid rgba(255, 255, 255, 0.15)',
                                                }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: { xs: 36, sm: 40 },
                                                    height: { xs: 36, sm: 40 },
                                                    borderRadius: '8px',
                                                    bgcolor: result.item.color || group.parentItem.color || '#6366f1',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mr: { xs: 1.5, sm: 2 },
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <IconComponent sx={{ fontSize: { xs: 20, sm: 22 }, color: '#FFFFFF' }} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography sx={{ color: theme.palette.mode === 'light' ? '#1E293B' : '#F1F5F9', fontWeight: 600, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                                                    {result.item.label}
                                                </Typography>
                                                <Typography sx={{ color: theme.palette.mode === 'light' ? '#64748B' : '#94A3B8', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
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

            {allResults.length === 0 && (
                <Box sx={{ textAlign: 'center', py: { xs: 4, sm: 6, md: 8 } }}>
                    <Typography sx={{ color: theme.palette.mode === 'light' ? '#64748B' : '#94A3B8', fontSize: '1rem' }}>
                        Sonuç bulunamadı
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
