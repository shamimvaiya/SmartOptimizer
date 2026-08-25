import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  BookOpen,
  Plus,
  ArrowRight,
  Sparkles,
  Download,
  Upload,
  Edit2,
  Trash2,
  Bookmark,
  Check,
  Zap,
  Layers,
  FolderOpen,
} from 'lucide-react';
import { MacroTemplateItem, getStoredTemplates, saveStoredTemplates } from '../data/macroTemplates';
import { MacroNode } from '../types';
import { Language, translations } from '../i18n/translations';

interface MacroTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (nodes: MacroNode[], mode: 'replace' | 'append') => void;
  currentGraphNodes?: MacroNode[];
  lang?: Language;
}

export const MacroTemplatesModal: React.FC<MacroTemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  currentGraphNodes = [],
  lang = 'bn',
}) => {
  const t = translations[lang];
  const isBn = lang === 'bn';

  const [templates, setTemplates] = useState<MacroTemplateItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [applyMode, setApplyMode] = useState<'replace' | 'append'>('replace');

  // New / Edit Form Dialog State
  const [isEditingFormOpen, setIsEditingFormOpen] = useState<boolean>(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Aimbot & Combat');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formTags, setFormTags] = useState<string>('');
  const [formColor, setFormColor] = useState<string>('#39ff14');

  // File Input Ref for Template JSON Import
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load Templates from localStorage on mount & when opened
  useEffect(() => {
    if (isOpen) {
      const loaded = getStoredTemplates();
      setTemplates(loaded);
      if (loaded.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(loaded[0].id);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['All', 'Aimbot & Combat', 'Recoil & Spray', 'Farming & Loot', 'Automation & AFK', 'Custom'];

  const filteredTemplates =
    selectedCategory === 'All'
      ? templates
      : templates.filter((tpl) => tpl.category === selectedCategory);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0] || null;

  // Save changes to localStorage & State
  const persistTemplates = (newTemplates: MacroTemplateItem[]) => {
    setTemplates(newTemplates);
    saveStoredTemplates(newTemplates);
  };

  // Handle Apply Template to Canvas
  const handleApply = () => {
    if (!selectedTemplate) return;
    const idMap: Record<string, string> = {};
    const timestamp = Date.now();
    const clonedNodes: MacroNode[] = selectedTemplate.nodes.map((n, idx) => {
      const newId = `node_tpl_${timestamp}_${idx}`;
      idMap[n.id] = newId;
      return {
        ...n,
        id: newId,
      };
    });

    // Remap wires
    clonedNodes.forEach((node) => {
      node.nextNodes = (node.nextNodes || []).map((oldId) => idMap[oldId] || oldId);
    });

    onApplyTemplate(clonedNodes, applyMode);
    onClose();
  };

  // Open "Save Current Graph As Template" Form
  const handleOpenSaveCurrentAsTemplate = () => {
    if (currentGraphNodes.length === 0) {
      alert(isBn ? 'ক্যানভাসে কোনো নোড নেই! আগে গ্রাফ সাজান।' : 'Canvas is empty! Add nodes to save as template.');
      return;
    }
    setEditingTemplateId(null);
    setFormName(isBn ? `কাস্টম ম্যাক্রো টেমপ্লেট #${templates.length + 1}` : `Custom Macro Preset #${templates.length + 1}`);
    setFormCategory('Aimbot & Combat');
    setFormDescription(isBn ? `${currentGraphNodes.length} টি নোড সংবলিত কাস্টম সিকোয়েন্স।` : `Sequence with ${currentGraphNodes.length} configured nodes.`);
    setFormTags('Custom, Macro, Rapid');
    setFormColor('#39ff14');
    setIsEditingFormOpen(true);
  };

  // Open "Edit Existing Template" Form
  const handleOpenEditTemplate = (tpl: MacroTemplateItem) => {
    setEditingTemplateId(tpl.id);
    setFormName(tpl.name);
    setFormCategory(tpl.category);
    setFormDescription(tpl.description);
    setFormTags(tpl.tags.join(', '));
    setFormColor(tpl.badgeColor || '#00e5ff');
    setIsEditingFormOpen(true);
  };

  // Submit Save / Edit Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const parsedTags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editingTemplateId) {
      // Edit existing
      const updated = templates.map((tpl) => {
        if (tpl.id === editingTemplateId) {
          return {
            ...tpl,
            name: formName.trim(),
            category: formCategory,
            description: formDescription.trim(),
            tags: parsedTags,
            badgeColor: formColor,
          };
        }
        return tpl;
      });
      persistTemplates(updated);
    } else {
      // Create new from current graph
      const newTemplate: MacroTemplateItem = {
        id: `tpl_${Date.now()}`,
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        badgeColor: formColor,
        tags: parsedTags.length > 0 ? parsedTags : ['Custom'],
        nodesCount: currentGraphNodes.length,
        nodes: JSON.parse(JSON.stringify(currentGraphNodes)),
        createdAt: new Date().toISOString(),
      };
      const updated = [newTemplate, ...templates];
      persistTemplates(updated);
      setSelectedTemplateId(newTemplate.id);
    }

    setIsEditingFormOpen(false);
  };

  // Delete Template
  const handleDeleteTemplate = (id: string) => {
    const confirmMsg = isBn ? 'আপনি কি নিশ্চিত যে এই টেমপ্লেটটি মুছে ফেলতে চান?' : 'Are you sure you want to delete this template?';
    if (window.confirm(confirmMsg)) {
      const updated = templates.filter((tpl) => tpl.id !== id);
      persistTemplates(updated);
      if (selectedTemplateId === id) {
        setSelectedTemplateId(updated[0]?.id || null);
      }
    }
  };

  // Export All Templates as JSON
  const handleExportAllTemplates = () => {
    if (templates.length === 0) {
      alert(isBn ? 'এক্সপোর্ট করার মতো কোনো টেমপ্লেট নেই।' : 'No templates to export.');
      return;
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(templates, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `smart_macro_templates_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Templates from JSON
  const handleImportTemplatesFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        let importedList: MacroTemplateItem[] = [];

        if (Array.isArray(parsed)) {
          importedList = parsed;
        } else if (parsed.id && parsed.nodes) {
          // Single template object
          importedList = [parsed];
        } else if (parsed.templates && Array.isArray(parsed.templates)) {
          importedList = parsed.templates;
        }

        if (importedList.length === 0) {
          alert(isBn ? 'ফাইলে কোনো বৈধ টেমপ্লেট পাওয়া যায়নি।' : 'No valid templates found in JSON file.');
          return;
        }

        // Validate and clean IDs
        const cleaned: MacroTemplateItem[] = importedList.map((tpl, i) => ({
          id: tpl.id || `tpl_imported_${Date.now()}_${i}`,
          name: tpl.name || `Imported Preset #${i + 1}`,
          category: tpl.category || 'Custom',
          description: tpl.description || 'Imported macro sequence.',
          badgeColor: tpl.badgeColor || '#00e5ff',
          tags: Array.isArray(tpl.tags) ? tpl.tags : ['Imported'],
          nodesCount: Array.isArray(tpl.nodes) ? tpl.nodes.length : 0,
          nodes: Array.isArray(tpl.nodes) ? tpl.nodes : [],
        }));

        const merged = [...cleaned, ...templates.filter((t) => !cleaned.some((c) => c.id === t.id))];
        persistTemplates(merged);
        if (cleaned.length > 0) {
          setSelectedTemplateId(cleaned[0].id);
        }
        alert(isBn ? `সফলভাবে ${cleaned.length} টি টেমপ্লেট ইমপোর্ট হয়েছে!` : `Successfully imported ${cleaned.length} template(s)!`);
      } catch (err) {
        console.error('Import error:', err);
        alert(isBn ? 'অকার্যকর JSON ফরম্যাট।' : 'Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#0e1017] border-2 border-[#1f283d] rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-[0_0_50px_rgba(0,229,255,0.15)] flex flex-col overflow-hidden">
        {/* Hidden File Input for JSON Import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportTemplatesFile}
          accept=".json,application/json"
          className="hidden"
        />

        {/* Header */}
        <div className="h-16 px-6 bg-[#131622] border-b border-[#1f283d] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>{t.templateLibraryTitle}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#162b16] text-[#39ff14] border border-[#39ff14]/50 font-mono">
                  {templates.length} {isBn ? 'সংরক্ষিত' : 'Saved'}
                </span>
              </h3>
              <p className="text-xs text-[#8892b0]">{t.templateLibrarySubtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Save Current Graph Button */}
            <button
              onClick={handleOpenSaveCurrentAsTemplate}
              className="h-9 px-3 rounded-xl bg-[#1a2a1a] hover:bg-[#233a23] text-[#39ff14] border border-[#39ff14] font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.15)]"
              title="Save current canvas nodes as a new template"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.saveCurrentAsTemplate}</span>
            </button>

            {/* Import JSON Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-3 rounded-xl bg-[#10252e] hover:bg-[#143340] text-[#00e5ff] border border-[#00e5ff]/50 font-bold text-xs flex items-center space-x-1 transition-all cursor-pointer"
              title="Import Templates from .json file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.importJson}</span>
            </button>

            {/* Export JSON Button */}
            <button
              onClick={handleExportAllTemplates}
              disabled={templates.length === 0}
              className="h-9 px-3 rounded-xl bg-[#152a1d] hover:bg-[#1d3d2a] text-[#00e676] border border-[#00e676]/50 font-bold text-xs flex items-center space-x-1 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Export all templates to .json file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportJson}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1a1d2b] hover:bg-[#252a3d] text-[#8892b0] hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-2.5 bg-[#0a0c12] border-b border-[#1f283d] flex items-center space-x-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#00e5ff] text-black shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                  : 'bg-[#141824] text-[#8892b0] hover:text-white border border-[#1f283d]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Modal Body: Left List + Right Preview */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden">
          {/* Left: Template Cards List */}
          <div className="md:col-span-5 p-4 overflow-y-auto border-r border-[#1f283d] space-y-2.5 bg-[#0b0d14]">
            {filteredTemplates.length > 0 ? (
              filteredTemplates.map((tpl) => {
                const isSelected = tpl.id === selectedTemplate?.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-[#132029] border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                        : 'bg-[#121520] border-[#1f283d] hover:border-[#00e5ff]/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: `${tpl.badgeColor || '#00e5ff'}15`,
                            color: tpl.badgeColor || '#00e5ff',
                            border: `1px solid ${tpl.badgeColor || '#00e5ff'}40`,
                          }}
                        >
                          {tpl.category}
                        </span>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditTemplate(tpl);
                            }}
                            className="p-1 rounded text-[#8892b0] hover:text-[#00e5ff] hover:bg-black/30 transition-colors"
                            title="Edit template details"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(tpl.id);
                            }}
                            className="p-1 rounded text-[#8892b0] hover:text-[#ff4444] hover:bg-black/30 transition-colors"
                            title="Delete template"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1 truncate">{tpl.name}</h4>
                      <p className="text-xs text-[#8892b0] line-clamp-2">{tpl.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1f283d]/60 text-[10px] text-[#64748b]">
                      <span>{tpl.nodes?.length || 0} Nodes</span>
                      <div className="flex flex-wrap gap-1">
                        {(tpl.tags || []).slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.2 rounded bg-[#1b2130] text-[#ccd6f6] font-mono text-[9px]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 rounded-xl bg-[#121520] border border-dashed border-[#1f283d] text-center space-y-3">
                <FolderOpen className="w-8 h-8 text-[#64748b] mx-auto" />
                <div className="text-sm font-bold text-white">{t.noTemplatesFound}</div>
                <p className="text-xs text-[#8892b0] leading-relaxed">{t.noTemplatesHint}</p>
              </div>
            )}
          </div>

          {/* Right: Detailed Template Preview & Node Step Chain */}
          <div className="md:col-span-7 p-6 overflow-y-auto bg-[#0e1017] flex flex-col justify-between">
            {selectedTemplate ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: selectedTemplate.badgeColor || '#00e5ff' }}
                      ></span>
                      <span className="text-xs font-mono uppercase tracking-wider text-[#8892b0]">
                        {selectedTemplate.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white">{selectedTemplate.name}</h3>
                    <p className="text-xs text-[#8892b0] mt-1 leading-relaxed">
                      {selectedTemplate.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEditTemplate(selectedTemplate)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1f283d] text-[#00e5ff] border border-[#00e5ff]/30 text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{t.editTemplate}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#2a1414] hover:bg-[#3d1818] text-[#ff4444] border border-[#ff4444]/40 text-xs font-bold flex items-center space-x-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Step by Step Flow Sequence */}
                <div>
                  <h4 className="text-xs font-bold text-[#00e5ff] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>
                      {isBn ? 'এক্সিকিউশন নোড সিকোয়েন্স' : 'Execution Node Chain'} (
                      {selectedTemplate.nodes?.length || 0} {isBn ? 'ধাপ' : 'Steps'}):
                    </span>
                  </h4>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {selectedTemplate.nodes && selectedTemplate.nodes.length > 0 ? (
                      selectedTemplate.nodes.map((node, idx) => (
                        <div
                          key={node.id || idx}
                          className="p-2.5 rounded-xl bg-[#141824] border border-[#1f283d] flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-[#1b2233] text-[#00e5ff] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-bold text-white">{node.actionType}</span>
                            <span className="text-[11px] font-mono text-[#8892b0] truncate">
                              ({node.parameters})
                            </span>
                          </div>

                          {idx < selectedTemplate.nodes.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-[#39ff14] shrink-0" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-lg bg-[#141824] text-xs text-[#8892b0]">
                        {isBn ? 'এই টেমপ্লেটে কোনো নোড নেই।' : 'No nodes in this template.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-[#8892b0] py-12">
                <FolderOpen className="w-12 h-12 text-[#64748b] mx-auto mb-2" />
                <div className="text-sm font-bold text-white">{t.noTemplatesFound}</div>
              </div>
            )}

            {/* Bottom Actions */}
            {selectedTemplate && (
              <div className="pt-6 mt-6 border-t border-[#1f283d] flex items-center justify-between gap-4">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-[#8892b0] font-semibold">{isBn ? 'মোড:' : 'Mode:'}</span>
                  <button
                    type="button"
                    onClick={() => setApplyMode('replace')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      applyMode === 'replace'
                        ? 'bg-[#ff4444]/20 text-[#ff4444] border border-[#ff4444]/50'
                        : 'text-[#8892b0] hover:text-white'
                    }`}
                  >
                    {t.replaceCanvas}
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplyMode('append')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      applyMode === 'append'
                        ? 'bg-[#39ff14]/20 text-[#39ff14] border border-[#39ff14]/50'
                        : 'text-[#8892b0] hover:text-white'
                    }`}
                  >
                    {t.appendGraph}
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-[#141824] hover:bg-[#1f283d] text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleApply}
                    className="px-5 py-2 rounded-xl bg-[#00e5ff] hover:bg-[#00cbe6] text-black font-extrabold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t.applyTemplate}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit / Create Form Modal */}
      {isEditingFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#11131c] border border-[#00e5ff]/50 rounded-2xl w-full max-w-lg p-6 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#00e5ff]" />
              <span>{editingTemplateId ? t.editTemplate : t.saveCurrentAsTemplate}</span>
            </h3>

            <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#8892b0] font-semibold mb-1">{t.templateName}</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#181c2b] border border-[#1f283d] text-white focus:border-[#00e5ff] outline-none"
                  placeholder="e.g. Free Fire Headshot Auto Lock"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8892b0] font-semibold mb-1">{t.templateCategory}</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#181c2b] border border-[#1f283d] text-white focus:border-[#00e5ff] outline-none cursor-pointer"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#8892b0] font-semibold mb-1">Color Theme</label>
                  <div className="flex items-center space-x-2">
                    {['#39ff14', '#00e5ff', '#ff007f', '#ffd600', '#a855f7'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                          formColor === c ? 'scale-125 border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#8892b0] font-semibold mb-1">{t.templateDescription}</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#181c2b] border border-[#1f283d] text-white focus:border-[#00e5ff] outline-none resize-none"
                  placeholder="Briefly describe what this macro logic performs..."
                />
              </div>

              <div>
                <label className="block text-[#8892b0] font-semibold mb-1">{t.templateTags}</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-[#181c2b] border border-[#1f283d] text-white focus:border-[#00e5ff] outline-none font-mono"
                  placeholder="Aim, Headshot, Zero-Recoil, Burst"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#181c2b] hover:bg-[#252a3d] text-white font-bold transition-all cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#39ff14] hover:bg-[#32e012] text-black font-extrabold transition-all cursor-pointer shadow-[0_0_12px_rgba(57,255,20,0.3)]"
                >
                  {t.saveChanges}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
