import React, { useState } from 'react';
import { UserCheck, Edit3, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext.jsx';
import { useNavigate } from 'react-router-dom';

export const ProfileConfirmation = ({ onConfirm }) => {
  const { profile, setProfile, language, triggerEligibilityCheck } = useChatContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAndConfirm = async () => {
    setProfile(formData);
    setIsEditing(false);
    if (onConfirm) onConfirm(formData);
    await triggerEligibilityCheck(formData);
    navigate('/results');
  };

  const formatINR = (val) => {
    if (!val) return 'Not Provided';
    return '₹' + Number(val).toLocaleString('en-IN');
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-brand-200 shadow-xl p-5 my-4 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {language === 'hi' ? 'अपनी प्रोफ़ाइल की पुष्टि करें' : 'Confirm Your Profile Details'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'hi' ? 'सटीक पात्रता जांच के लिए विवरण सत्यापित करें' : 'Verified before deterministic rule engine evaluation'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center space-x-1 text-xs font-semibold text-brand-600 hover:text-brand-800 px-2.5 py-1 rounded-md bg-brand-50 border border-brand-200 hover:bg-brand-100 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? (language === 'hi' ? 'रद्द करें' : 'Cancel') : (language === 'hi' ? 'संशोधित करें' : 'Edit')}</span>
        </button>
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Category */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'hi' ? 'सामाजिक श्रेणी' : 'Social Category'}
          </span>
          {isEditing ? (
            <select
              value={formData.category || 'OBC'}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="mt-1 w-full bg-white border border-slate-300 rounded p-1 text-xs font-semibold"
            >
              <option value="SC">SC (Scheduled Caste)</option>
              <option value="ST">ST (Scheduled Tribe)</option>
              <option value="OBC">OBC (Other Backward Class)</option>
              <option value="GENERAL">General</option>
            </select>
          ) : (
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{formData.category || 'N/A'}</span>
          )}
        </div>

        {/* Gender */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'hi' ? 'लिंग (Gender)' : 'Gender'}
          </span>
          {isEditing ? (
            <select
              value={formData.gender || 'female'}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="mt-1 w-full bg-white border border-slate-300 rounded p-1 text-xs font-semibold"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="transgender">Transgender</option>
            </select>
          ) : (
            <span className="font-bold text-slate-800 text-sm capitalize mt-0.5 block">{formData.gender || 'N/A'}</span>
          )}
        </div>

        {/* Annual Income */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'hi' ? 'वार्षिक आय' : 'Annual Income'}
          </span>
          {isEditing ? (
            <input
              type="number"
              value={formData.familyIncome || ''}
              onChange={(e) => handleInputChange('familyIncome', Number(e.target.value))}
              className="mt-1 w-full bg-white border border-slate-300 rounded p-1 text-xs font-semibold"
              placeholder="e.g. 250000"
            />
          ) : (
            <span className="font-bold text-emerald-700 text-sm mt-0.5 block">{formatINR(formData.familyIncome)}</span>
          )}
        </div>

        {/* Project Cost */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'hi' ? 'परियोजना लागत' : 'Project Cost'}
          </span>
          {isEditing ? (
            <input
              type="number"
              value={formData.projectCost || ''}
              onChange={(e) => handleInputChange('projectCost', Number(e.target.value))}
              className="mt-1 w-full bg-white border border-slate-300 rounded p-1 text-xs font-semibold"
              placeholder="e.g. 600000"
            />
          ) : (
            <span className="font-bold text-brand-700 text-sm mt-0.5 block">{formatINR(formData.projectCost)}</span>
          )}
        </div>

        {/* Business Type */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'hi' ? 'व्यवसाय का प्रकार' : 'Business Type'}
          </span>
          {isEditing ? (
            <input
              type="text"
              value={formData.businessType || ''}
              onChange={(e) => handleInputChange('businessType', e.target.value)}
              className="mt-1 w-full bg-white border border-slate-300 rounded p-1 text-xs font-semibold"
              placeholder="e.g. tailoring"
            />
          ) : (
            <span className="font-bold text-slate-800 text-sm capitalize mt-0.5 block">{formData.businessType || 'General'}</span>
          )}
        </div>

        {/* Age */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'hi' ? 'आयु (वर्ष)' : 'Age (Years)'}
          </span>
          {isEditing ? (
            <input
              type="number"
              value={formData.age || ''}
              onChange={(e) => handleInputChange('age', Number(e.target.value))}
              className="mt-1 w-full bg-white border border-slate-300 rounded p-1 text-xs font-semibold"
              placeholder="e.g. 28"
            />
          ) : (
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">{formData.age ? `${formData.age} Yrs` : 'N/A'}</span>
          )}
        </div>
      </div>

      {/* Confirmation CTA */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{language === 'hi' ? 'शर्तों के अनुसार 100% सटीक जांच' : '100% Rule Engine Checked'}</span>
        </div>

        <button
          onClick={handleSaveAndConfirm}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-xs shadow-md hover:from-emerald-700 hover:to-emerald-800 transition-all transform hover:-translate-y-0.5"
        >
          <span>{language === 'hi' ? 'पुष्टि करें और पात्रता देखें' : 'Confirm & Evaluate Eligibility'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
