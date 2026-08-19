import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  QrCode,
  Lock,
  User,
  Mail,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CampusItem } from '../types';
import { CAMPUS_LOCATIONS } from '../data/campusData';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: CampusItem | null;
  candidateItem: CampusItem | null;
  onConfirmReunited: (itemId1: string, itemId2?: string) => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  targetItem,
  candidateItem,
  onConfirmReunited,
}) => {
  const [claimantName, setClaimantName] = useState('');
  const [claimantEmail, setClaimantEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [pickupLocation, setPickupLocation] = useState(
    CAMPUS_LOCATIONS[0].deskName || CAMPUS_LOCATIONS[0].name
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [claimId, setClaimId] = useState('');

  if (!isOpen || !targetItem) return null;

  const itemToClaim = targetItem.type === 'found' ? targetItem : candidateItem || targetItem;
  const question =
    itemToClaim.verificationQuestion?.question ||
    'Can you describe any unique scratches, stickers, contents, or serial marks on this item?';

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();

    if (!claimantName.trim() || !claimantEmail.trim()) {
      alert('Please fill out your name and campus email.');
      return;
    }

    if (!verificationAnswer.trim()) {
      alert('Please provide an answer to the verification check.');
      return;
    }

    const generatedId = `CLAIM-${Math.floor(100000 + Math.random() * 900000)}`;
    setClaimId(generatedId);
    setIsSuccess(true);

    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Update statuses
    onConfirmReunited(targetItem.id, candidateItem?.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isSuccess ? 'Ownership Verified & Claim Issued' : 'Item Verification & Safe Claim'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Campus Property Custody Protocol
              </p>
            </div>
          </div>

          <button
            id="claim-modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {isSuccess ? (
            <div className="space-y-4 text-center py-2 animate-fadeIn">
              
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Item Status: Reunited 🎉
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                  Claim Pass Verified!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto mt-1">
                  Your verification answer has been recorded. Present this digital pass or student ID to collect your item.
                </p>
              </div>

              {/* Digital Claim Voucher */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-left space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Claim ID</div>
                    <div className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {claimId}
                    </div>
                  </div>
                  <QrCode className="w-8 h-8 text-slate-700 dark:text-slate-300" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-slate-400 text-[10px]">Claimant</div>
                    <div className="font-semibold text-slate-900 dark:text-white">{claimantName}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px]">Campus Email</div>
                    <div className="font-semibold text-slate-900 dark:text-white truncate">{claimantEmail}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-slate-400 text-[10px]">Pickup Handover Location</div>
                    <div className="font-semibold text-indigo-600 dark:text-indigo-300 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {pickupLocation}
                    </div>
                  </div>
                </div>
              </div>

              <button
                id="claim-success-finish-btn"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl font-bold text-sm shadow-md transition-all"
              >
                Return to Campus Feed
              </button>

            </div>
          ) : (
            <form onSubmit={handleSubmitClaim} className="space-y-4">
              
              {/* Item Snapshot */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <img
                  src={itemToClaim.imageUrl}
                  alt={itemToClaim.title}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    Target Item
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {itemToClaim.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate">
                    {itemToClaim.location.name}
                  </p>
                </div>
              </div>

              {/* Security Verification Prompt */}
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-1.5">
                <label className="block text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Ownership Verification Question *
                </label>
                <p className="text-xs text-amber-900 dark:text-amber-300 font-medium">
                  "{question}"
                </p>
                <textarea
                  id="claim-verification-answer-input"
                  required
                  rows={2}
                  value={verificationAnswer}
                  onChange={(e) => setVerificationAnswer(e.target.value)}
                  placeholder="Provide your matching answer or specific description to verify ownership..."
                  className="w-full mt-1.5 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Claimant Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    id="claimant-name-input"
                    type="text"
                    required
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Campus Email Address *
                  </label>
                  <input
                    id="claimant-email-input"
                    type="email"
                    required
                    value={claimantEmail}
                    onChange={(e) => setClaimantEmail(e.target.value)}
                    placeholder="e.g. m.vance@campus.edu"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Student / Staff ID Number (Optional)
                </label>
                <input
                  id="claimant-student-id-input"
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. 98402148"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              {/* Handover Collection Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  Designated Campus Handover / Collection Desk
                </label>
                <select
                  id="claim-pickup-location-select"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                >
                  {CAMPUS_LOCATIONS.filter((l) => l.hasOfficialDropoffDesk).map((loc) => (
                    <option key={loc.id} value={loc.deskName || loc.name}>
                      {loc.deskName} ({loc.zone})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Campus security verifies photo ID at collection.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  id="claim-cancel-btn"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-verification-claim-btn"
                  className="px-5 py-2 text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Submit Verification & Claim
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
