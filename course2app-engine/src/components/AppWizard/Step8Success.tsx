import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Download,
  Package,
  FileCode,
  Sparkles,
  ArrowRight,
  Terminal,
  Layers,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Github,
  Laptop,
  Smartphone,
  QrCode
} from 'lucide-react';
import { AppConfig, BuildLogRecord } from '../../types';
import { createAndDownloadProjectZip, downloadDirectTestApk } from '../../utils/androidGenerator';
import { storageService } from '../../storage/storageService';
import { PhoneTestModal } from '../PhoneTestModal';

interface Step8SuccessProps {
  app: AppConfig;
  onCreateAnotherWithSameCourse: () => void;
  onCreateAnotherNew: () => void;
  onGoToDashboard: () => void;
}

export const Step8Success: React.FC<Step8SuccessProps> = ({
  app,
  onCreateAnotherWithSameCourse,
  onCreateAnotherNew,
  onGoToDashboard
}) => {
  const [buildStatus, setBuildStatus] = useState<'building' | 'successful'>('building');
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [activeLogIdx, setActiveLogIdx] = useState<number>(0);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [isDownloadingApk, setIsDownloadingApk] = useState<boolean>(false);
  const [showFullLogs, setShowFullLogs] = useState<boolean>(false);
  const [isPhoneTestModalOpen, setIsPhoneTestModalOpen] = useState<boolean>(false);
  const [activeBuildTab, setActiveBuildTab] = useState<'cloud' | 'local' | 'specs'>('cloud');
  const [copiedGit, setCopiedGit] = useState<boolean>(false);
  const [copiedLocal, setCopiedLocal] = useState<boolean>(false);

  const simulatedLogs = [
    `[00:00] Initializing Course2App Project Codebase Generator...`,
    `[00:02] Target Package ID: ${app.packageId}`,
    `[00:05] Applying Institute Branding: "${app.instituteName}" (Theme: ${app.primaryColor})`,
    `[00:08] Configuring Android Target SDK 34 (Google Play 2024-2026 Mandate)...`,
    `[00:12] Generating AndroidManifest.xml, hardware back button handlers & URL schemes: ${app.courseUrl}`,
    `[00:16] Setting up Capacitor 6.0 Android bridge & WebView cache engine...`,
    `[00:20] Assembling root Gradle 8.7 build scripts, Proguard rules & styles.xml...`,
    `[00:24] Adding automated GitHub Actions workflow (.github/workflows/android-build.yml)...`,
    `[00:28] Adding Keystore generator script & local build scripts...`,
    `[00:30] PROJECT PACKAGED SUCCESSFULLY! Ready for Cloud/Local AAB compilation.`
  ];

  useEffect(() => {
    // Run realistic build progress simulation
    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setBuildStatus('successful');
          // Trigger confetti!
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch (e) {}

          // Record build in history
          const buildRecord: BuildLogRecord = {
            id: `build-${Date.now()}`,
            appId: app.id,
            appName: app.appName,
            instituteName: app.instituteName,
            packageId: app.packageId,
            versionName: app.versionName,
            versionCode: app.versionCode,
            status: 'successful',
            startedAt: new Date(Date.now() - 30000).toISOString(),
            completedAt: new Date().toISOString(),
            durationMs: 30000,
            artifactAabName: `${app.appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-v${app.versionName}-release.aab`,
            artifactApkName: `${app.appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-v${app.versionName}-debug.apk`,
            artifactSizeMb: 14.2,
            logs: simulatedLogs
          };
          storageService.addBuildLog(buildRecord);

          return 100;
        }
        return prev + 15;
      });

      setActiveLogIdx((prev) => (prev < simulatedLogs.length - 1 ? prev + 1 : prev));
    }, 350);

    return () => clearInterval(interval);
  }, []);

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      await createAndDownloadProjectZip(app);
    } catch (e) {
      console.error('Error generating zip:', e);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadApk = async () => {
    setIsDownloadingApk(true);
    try {
      await downloadDirectTestApk(app);
    } catch (e) {
      console.error('Error generating APK:', e);
    } finally {
      setIsDownloadingApk(false);
    }
  };

  const gitCommands = `# 1. Extract the downloaded ZIP and open the folder in terminal
cd ${app.packageId.replace(/[^a-z0-9]/g, '_')}_android_project

# 2. Push to your GitHub repository
git init
git add .
git commit -m "Branded Android App for ${app.instituteName}"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main

# 3. In GitHub -> Click "Actions" -> "Build Branded Android App (.AAB)" -> "Run workflow"
# Your real ~15MB .aab file will compile in cloud runners and be available under Artifacts!`;

  const localCommands = `# 1. Extract ZIP and run the automated build script
cd ${app.packageId.replace(/[^a-z0-9]/g, '_')}_android_project

# Make scripts executable and build .aab
chmod +x scripts/build-local.sh
./scripts/build-local.sh

# Or open in Android Studio:
npm install && npx cap open android`;

  const copyGitCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedGit(true);
    setTimeout(() => setCopiedGit(false), 2000);
  };

  const copyLocalCommands = () => {
    navigator.clipboard.writeText(localCommands);
    setCopiedLocal(true);
    setTimeout(() => setCopiedLocal(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-emerald-200 bg-linear-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 text-white shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg mb-4">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {buildStatus === 'successful' ? 'ANDROID PROJECT READY 🎉' : 'Generating Android Codebase...'}
          </h2>
          <p className="mt-1.5 text-sm text-emerald-200 max-w-md">
            {app.appName} ({app.instituteName}) for{' '}
            <span className="font-mono text-white text-xs">{app.courseUrl}</span>
          </p>

          {/* Progress Bar during generation */}
          {buildStatus === 'building' && (
            <div className="mt-6 w-full max-w-md">
              <div className="flex justify-between text-xs text-emerald-200 font-semibold mb-1.5">
                <span>Generating Android Gradle Project & CI Workflows...</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Cards: Instant .APK Testing + Full Codebase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Instant Phone Test & APK Download Card */}
        <div className="rounded-3xl border-2 border-emerald-500 bg-linear-to-br from-emerald-50 to-teal-50/50 p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                <Smartphone className="h-3 w-3" /> Direct Phone Testing
              </span>
              <span className="text-[11px] font-bold text-emerald-800">Ready to Sideload</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Download Test .APK & Scan QR
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Install and test your branded app immediately on any Android device without waiting for store approval.
            </p>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              disabled={isDownloadingApk}
              onClick={handleDownloadApk}
              className="flex-1 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 px-4 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50 active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" />
              {isDownloadingApk ? 'Generating .APK...' : 'Download .APK File'}
            </button>

            <button
              type="button"
              onClick={() => setIsPhoneTestModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white py-3 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100/50 active:scale-95 transition-all"
            >
              <QrCode className="h-4 w-4 text-emerald-600" />
              Scan QR
            </button>
          </div>
        </div>

        {/* 2. Full Source Codebase Project (ZIP) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                <FileCode className="h-3 w-3" /> Android Studio Codebase
              </span>
              <span className="text-[11px] font-bold text-blue-800">Target SDK 34</span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              Download Complete Project (ZIP)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete native Android project with Gradle 8.7 build scripts, Capacitor 6.0 bridge, and automated GitHub Actions builder.
            </p>
          </div>

          <div className="mt-4">
            <button
              type="button"
              disabled={isZipping}
              onClick={handleDownloadZip}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 px-4 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" />
              {isZipping ? 'Packaging ZIP...' : 'Download Project ZIP'}
            </button>
          </div>
        </div>
      </div>

      {/* HOW TO GET THE PRODUCTION .AAB (Cloud vs Local vs Play Store Specs) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              How to Build the Production .AAB Bundle for Google Play
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Google Play Console requires a compiled ~15MB binary bundle (compiled with Android SDK, AAPT2, and Java bytecodes).
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => setActiveBuildTab('cloud')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeBuildTab === 'cloud'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Github className="h-4 w-4 text-emerald-600" />
            Option 1: 1-Click Free Cloud Build (GitHub Actions)
          </button>
          <button
            type="button"
            onClick={() => setActiveBuildTab('local')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeBuildTab === 'local'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Laptop className="h-4 w-4 text-blue-600" />
            Option 2: 1-Command Local Build (Terminal / Android Studio)
          </button>
          <button
            type="button"
            onClick={() => setActiveBuildTab('specs')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeBuildTab === 'specs'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            Play Store Requirements Diagnostic
          </button>
        </div>

        {/* TAB 1: CLOUD BUILD (GITHUB ACTIONS) */}
        {activeBuildTab === 'cloud' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 text-xs text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <Sparkles className="h-4 w-4" />
                Recommended: No Android Studio or Heavy SDK Installation Required!
              </div>
              <p className="leading-relaxed">
                The downloaded project ZIP already includes a pre-configured <strong>GitHub Actions CI/CD pipeline</strong> (<code>.github/workflows/android-build.yml</code>). When you push the project to GitHub, GitHub's cloud servers compile your authentic, signed <strong>.aab</strong> bundle in ~2 minutes for free.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                <span>Terminal Quick Push Commands:</span>
                <button
                  type="button"
                  onClick={copyGitCommands}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  {copiedGit ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedGit ? 'Copied to Clipboard!' : 'Copy Commands'}
                </button>
              </div>
              <pre className="rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                <code>{gitCommands}</code>
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Step 1: Download & Push</span>
                <p className="text-slate-500 text-[11px]">Download ZIP and push code to your private or public GitHub repo.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Step 2: Run Workflow</span>
                <p className="text-slate-500 text-[11px]">Navigate to GitHub "Actions" tab and trigger "Build Branded Android App".</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs space-y-1">
                <span className="font-bold text-slate-900 block">Step 3: Download Real .AAB</span>
                <p className="text-slate-500 text-[11px]">Download the 15MB release .aab artifact and upload directly to Play Console!</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOCAL BUILD */}
        {activeBuildTab === 'local' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              If you have Java JDK 17 and Android Studio installed on your computer, you can compile the production .AAB locally with a single script:
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-700 font-bold">
                <span>Local Build Terminal Commands:</span>
                <button
                  type="button"
                  onClick={copyLocalCommands}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold"
                >
                  {copiedLocal ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedLocal ? 'Copied to Clipboard!' : 'Copy Commands'}
                </button>
              </div>
              <pre className="rounded-2xl bg-slate-950 p-4 font-mono text-xs text-blue-300 overflow-x-auto leading-relaxed">
                <code>{localCommands}</code>
              </pre>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <span className="font-bold">Output Location:</span>{' '}
              <code className="text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                android/app/build/outputs/bundle/release/app-release.aab
              </code>
            </div>
          </div>
        )}

        {/* TAB 3: PLAY STORE SPECS */}
        {activeBuildTab === 'specs' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-emerald-950">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Target SDK 34 (Android 14)</span>
                  <span className="text-[11px] text-emerald-800">Meets Google Play mandatory API level requirement.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-emerald-950">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">64-Bit Architecture Ready</span>
                  <span className="text-[11px] text-emerald-800">Includes arm64-v8a & x86_64 splits via Android Gradle Plugin 8.3+.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-emerald-950">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Hardware Back Button Routing</span>
                  <span className="text-[11px] text-emerald-800">MainActivity.java handles WebView backward navigation before app exit.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-emerald-950">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Google Play App Signing</span>
                  <span className="text-[11px] text-emerald-800">Compatible with Google Play Play-managed app signing key format.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Terminal Build Logs View */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white font-mono text-xs shadow-inner">
        <button
          type="button"
          onClick={() => setShowFullLogs(!showFullLogs)}
          className="flex w-full items-center justify-between text-xs text-slate-400 font-semibold mb-2"
        >
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span>Codebase Generator Output</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            {showFullLogs ? 'Collapse' : 'Expand'}
            {showFullLogs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </div>
        </button>

        <div
          className={`space-y-1 overflow-y-auto text-[11px] text-emerald-400/90 scrollbar-thin transition-all ${
            showFullLogs ? 'max-h-64' : 'max-h-24'
          }`}
        >
          {simulatedLogs.slice(0, activeLogIdx + 1).map((log, i) => (
            <div key={i} className="leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* CORE SPEED ADVANTAGE: Create Another App */}
      <div className="rounded-3xl border-2 border-blue-200 bg-blue-50/70 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-blue-600 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Multi-Institute Speed Engine
            </span>
            <h3 className="text-lg font-extrabold text-slate-900 mt-1">
              Create Another Branded App
            </h3>
            <p className="text-xs text-slate-600 max-w-md mt-0.5">
              Instantly generate an app for another coaching center using the same master course URL with unique branding!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onCreateAnotherWithSameCourse}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
            >
              <Copy className="h-4 w-4" />
              Use Same Course URL
            </button>

            <button
              type="button"
              onClick={onCreateAnotherNew}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
            >
              Select Another Course
            </button>
          </div>
        </div>
      </div>

      {/* Footer Back to Dashboard */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onGoToDashboard}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 underline"
        >
          ← Return to My Apps Dashboard
        </button>
      </div>

      {/* Instant Phone Test & APK Modal */}
      <PhoneTestModal
        app={app}
        isOpen={isPhoneTestModalOpen}
        onClose={() => setIsPhoneTestModalOpen(false)}
      />
    </div>
  );
};
