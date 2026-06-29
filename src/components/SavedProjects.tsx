import React, { useState, useEffect } from "react";
import { ShelterProject } from "../types";
import { FolderOpen, Save, Trash2, Calendar, Users, MapPin, Check } from "lucide-react";
import { translations } from "../locales";

interface SavedProjectsProps {
  currentProject: ShelterProject | null;
  onLoadProject: (project: ShelterProject) => void;
  onSaveCurrent: (name: string) => void;
  lang: "ar" | "en";
}

export default function SavedProjects({ currentProject, onLoadProject, onSaveCurrent, lang }: SavedProjectsProps) {
  const [savedList, setSavedList] = useState<ShelterProject[]>([]);
  const [saveName, setSaveName] = useState<string>("");
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");

  const t = translations[lang];

  useEffect(() => {
    loadList();
  }, []);

  const loadList = () => {
    const listJson = localStorage.getItem("rapid_shelter_saved_projects");
    if (listJson) {
      try {
        setSavedList(JSON.parse(listJson));
      } catch (err) {
        console.error("Error loading saved projects from localStorage", err);
      }
    }
  };

  const handleSave = () => {
    if (!currentProject) return;
    const nameToSave = saveName.trim() || (lang === "ar" ? `مشروع ${currentProject.input.locationName} - ${currentProject.input.disasterType}` : `${currentProject.input.locationName} - ${currentProject.input.disasterType} Project`);
    
    // Check if project exists, or create new
    const projectToSave: ShelterProject = {
      ...currentProject,
      createdAt: new Date().toISOString(),
      input: {
        ...currentProject.input,
        locationName: nameToSave
      }
    };

    const existing = localStorage.getItem("rapid_shelter_saved_projects");
    let currentSaved: ShelterProject[] = [];
    if (existing) {
      try {
        currentSaved = JSON.parse(existing);
      } catch (_) {}
    }

    // Append/Overwrite by location name (which serves as project name)
    const filtered = currentSaved.filter(p => p.input.locationName !== nameToSave);
    const newList = [projectToSave, ...filtered];
    
    localStorage.setItem("rapid_shelter_saved_projects", JSON.stringify(newList));
    setSavedList(newList);
    setSaveName("");
    setShowSaveModal(false);
    
    setSuccessMsg(t.saveSuccessMsg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleDelete = (locationName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent loading
    const filtered = savedList.filter((p) => p.input.locationName !== locationName);
    localStorage.setItem("rapid_shelter_saved_projects", JSON.stringify(filtered));
    setSavedList(filtered);
  };

  const isRtl = lang === "ar";

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-600" />
            {t.savedTitle}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">{t.savedSub}</p>
        </div>

        {currentProject && (
          <button
            id="save-current-config-btn"
            onClick={() => {
              const defaultName = lang === "ar" 
                ? `مخيم ${currentProject.input.locationName} (${currentProject.input.disasterType})`
                : `${currentProject.input.locationName} Camp (${currentProject.input.disasterType})`;
              setSaveName(defaultName);
              setShowSaveModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all self-stretch sm:self-auto justify-center cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {t.btnSave}
          </button>
        )}
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full border border-slate-100 shadow-xl" dir={isRtl ? "rtl" : "ltr"}>
            <h4 className={`font-bold text-slate-800 text-sm mb-2 ${isRtl ? "text-right" : "text-left"}`}>{t.saveModalTitle}</h4>
            <p className={`text-xs text-slate-500 mb-4 ${isRtl ? "text-right" : "text-left"}`}>{t.saveModalSub}</p>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className={`w-full border border-slate-200 rounded-xl p-3 text-xs mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isRtl ? "text-right" : "text-left"}`}
              placeholder={t.saveModalPlaceholder}
              dir={isRtl ? "rtl" : "ltr"}
            />
            <div className={`flex gap-2 ${isRtl ? "justify-end" : "justify-start"}`}>
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                id="confirm-save-project-btn"
                onClick={handleSave}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer"
              >
                {t.confirmSave}
              </button>
            </div>
          </div>
        </div>
      )}

      {savedList.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
          <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-55" />
          <p className="text-xs">{t.noSavedProjects}</p>
          <p className="text-[10px] text-slate-400 mt-1">{t.noSavedSub}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedList.map((project, index) => (
            <div
              key={index}
              onClick={() => onLoadProject(project)}
              className={`group border border-slate-100 hover:border-indigo-200 hover:shadow-md rounded-2xl p-4 cursor-pointer bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between ${isRtl ? "text-right" : "text-left"}`}
            >
              <div>
                <div className={`flex justify-between items-start mb-2 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                  <button
                    onClick={(e) => handleDelete(project.input.locationName, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    title={lang === "ar" ? "حذف المشروع" : "Delete Project"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold">
                    {project.input.disasterType}
                  </span>
                </div>

                <h4 className="font-bold text-slate-800 text-xs mb-2 group-hover:text-indigo-600 transition-colors">
                  {project.input.locationName}
                </h4>

                <div className="flex flex-col gap-1 text-[11px] text-slate-500">
                  <div className={`flex items-center gap-1.5 ${isRtl ? "justify-end" : "justify-start"}`}>
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{project.input.peopleCount} {t.peopleSuffix}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${isRtl ? "justify-end" : "justify-start"}`}>
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lang === "ar" ? "النموذج" : "Model"}: {project.suggestedModel.name}</span>
                  </div>
                </div>
              </div>

              <div className={`border-t border-slate-100 mt-3 pt-2.5 flex justify-between items-center text-[10px] text-slate-400 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
                <span className="font-semibold text-slate-600 hover:underline flex items-center gap-1 cursor-pointer">
                  {t.btnLoad}
                </span>
                <span className="flex items-center gap-1">
                  {new Date(project.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                  <Calendar className="w-3 h-3 text-slate-300" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
