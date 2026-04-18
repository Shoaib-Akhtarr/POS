'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, FileText, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface DateRangeFilterProps {
    onExportCSV?: (startDate: string, endDate: string) => void;
    onExportPDF?: (startDate: string, endDate: string) => void;
    onRangeChange?: (startDate: string, endDate: string) => void;
    initialStartDate?: string;
    initialEndDate?: string;
    className?: string;
}

export default function DateRangeFilter({ 
    onExportCSV, 
    onExportPDF, 
    onRangeChange,
    initialStartDate = '',
    initialEndDate = '',
    className = '' 
}: DateRangeFilterProps) {
    const { t, language } = useLanguage();
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);
    const [isExporting, setIsExporting] = useState<'' | 'csv' | 'pdf'>('');

    // Sync with parent on change
    React.useEffect(() => {
        if (onRangeChange) {
            onRangeChange(startDate, endDate);
        }
    }, [startDate, endDate, onRangeChange]);

    const isRangeValid = startDate && endDate && new Date(endDate) >= new Date(startDate);

    const handleCSVExport = async () => {
        if (!isRangeValid || !onExportCSV) return;
        setIsExporting('csv');
        await onExportCSV(startDate, endDate);
        setIsExporting('');
    };

    const handlePDFExport = async () => {
        if (!isRangeValid || !onExportPDF) return;
        setIsExporting('pdf');
        await onExportPDF(startDate, endDate);
        setIsExporting('');
    };

    return (
        <div className={`relative group ${className}`}>
            {/* Main Container with Glassmorphism */}
            <div className="relative overflow-hidden bg-sidebar/40 backdrop-blur-xl border border-sidebar-border/50 rounded-[2rem] p-6 lg:p-8 shadow-2xl shadow-black/10 transition-all duration-500 group-hover:border-pos-accent/20">
                {/* Background Decorative Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-pos-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-pos-accent/10 transition-colors duration-700"></div>

                <div className="relative flex flex-col lg:flex-row items-end gap-6">
                    {/* Date Inputs Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full lg:flex-1">
                        {/* Start Date */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 ml-1 block">
                                {t('startDate')}
                            </label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within/input:text-pos-accent transition-colors">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-background/50 border border-card-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-foreground focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent outline-none transition-all cursor-pointer hover:bg-background/80"
                                />
                            </div>
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 ml-1 block">
                                {t('endDate')}
                            </label>
                            <div className="relative group/input">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 group-focus-within/input:text-pos-accent transition-colors">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-background/50 border border-card-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-foreground focus:ring-4 focus:ring-pos-accent/10 focus:border-pos-accent outline-none transition-all cursor-pointer hover:bg-background/80"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Export Actions Section */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        {/* Download CSV Button */}
                        <motion.button
                            whileHover={isRangeValid ? { y: -2, scale: 1.02 } : {}}
                            whileTap={isRangeValid ? { scale: 0.98 } : {}}
                            onClick={handleCSVExport}
                            disabled={!isRangeValid || isExporting !== ''}
                            className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${
                                isRangeValid 
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30' 
                                : 'bg-muted/10 text-black/20 border border-card-border/50 cursor-not-allowed'
                            }`}
                        >
                            {isExporting === 'csv' ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                            )}
                            <span>{t('downloadCSV')}</span>
                        </motion.button>

                        {/* Export PDF Button */}
                        <motion.button
                            whileHover={isRangeValid ? { y: -2, scale: 1.02 } : {}}
                            whileTap={isRangeValid ? { scale: 0.98 } : {}}
                            onClick={handlePDFExport}
                            disabled={!isRangeValid || isExporting !== ''}
                            className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 ${
                                isRangeValid 
                                ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30' 
                                : 'bg-muted/10 text-black/20 border border-card-border/50 cursor-not-allowed'
                            }`}
                        >
                            {isExporting === 'pdf' ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <FileText className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                            )}
                            <span>{t('exportAllPDF')}</span>
                        </motion.button>
                    </div>
                </div>

                {/* Validation Hint (Mobile Only/Subtle) */}
                {!isRangeValid && (startDate || endDate) && (
                    <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-[10px] text-red-500 font-bold mt-4 flex items-center gap-1.5"
                    >
                        <span className="text-sm">⚠️</span>
                        {language === 'ur' ? 'براہ کرم درست تاریخ کی حد منتخب کریں' : 'Please select a valid date range'}
                    </motion.p>
                )}
            </div>
        </div>
    );
}
