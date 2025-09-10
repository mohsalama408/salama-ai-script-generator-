import React, { useState, useCallback, useEffect } from 'react';
import { analyzeStyle, generateScript } from './services/geminiService';
import StepCard from './components/StepCard';
import TextArea from './components/TextArea';
import Button from './components/Button';
import { BrainCircuitIcon } from './components/icons/BrainCircuitIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { CheckIcon } from './components/icons/CheckIcon';
import { TrashIcon } from './components/icons/TrashIcon';
import { SaveIcon } from './components/icons/SaveIcon';
import { LibraryIcon } from './components/icons/LibraryIcon';

interface SavedScript {
  id: string;
  content: string;
}

const App: React.FC = () => {
  const [savedScripts, setSavedScripts] = useState<SavedScript[]>([]);
  const [newScriptContent, setNewScriptContent] = useState<string>('');
  const [selectedScriptIds, setSelectedScriptIds] = useState<Set<string>>(new Set());
  
  const [newLesson, setNewLesson] = useState<string>('');
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [styleAnalysis, setStyleAnalysis] = useState<string>('');
  
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [isLoadingGeneration, setIsLoadingGeneration] = useState<boolean>(false);
  
  const [step1Complete, setStep1Complete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedScripts = localStorage.getItem('aiScriptGenerator_savedScripts');
      if (storedScripts) {
        setSavedScripts(JSON.parse(storedScripts));
      }
    } catch (e) {
      console.error("Failed to parse saved scripts from localStorage", e);
      setSavedScripts([]);
    }
  }, []);

  const persistScripts = (scripts: SavedScript[]) => {
    try {
      localStorage.setItem('aiScriptGenerator_savedScripts', JSON.stringify(scripts));
    } catch (e) {
      console.error("Failed to save scripts to localStorage", e);
    }
  };

  const handleSaveScript = () => {
    if (!newScriptContent.trim()) return;
    const newScript: SavedScript = {
      id: Date.now().toString(),
      content: newScriptContent.trim()
    };
    const updatedScripts = [...savedScripts, newScript];
    setSavedScripts(updatedScripts);
    persistScripts(updatedScripts);
    setNewScriptContent('');
  };

  const handleDeleteScript = (id: string) => {
    const updatedScripts = savedScripts.filter(script => script.id !== id);
    setSavedScripts(updatedScripts);
    persistScripts(updatedScripts);
    setSelectedScriptIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleToggleSelectScript = (id: string) => {
    setSelectedScriptIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const handleAnalyzeStyle = useCallback(async () => {
    const selectedScriptsContent = savedScripts
      .filter(script => selectedScriptIds.has(script.id))
      .map(script => script.content);

    if (selectedScriptsContent.length === 0) {
      setError('الرجاء اختيار نص واحد على الأقل من المكتبة لتحليله.');
      return;
    }

    const combinedScripts = selectedScriptsContent.join('\n\n---\n\n');
    setError(null);
    setIsLoadingAnalysis(true);
    setStyleAnalysis('');
    
    try {
      const analysis = await analyzeStyle(combinedScripts);
      setStyleAnalysis(analysis);
      setStep1Complete(true);
    } catch (e) {
      setError('حدث خطأ أثناء تحليل الأسلوب. الرجاء المحاولة مرة أخرى.');
      console.error(e);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [savedScripts, selectedScriptIds]);

  const handleGenerateScript = useCallback(async () => {
    if (!newLesson.trim()) {
      setError('الرجاء لصق الدرس الجديد أولاً.');
      return;
    }
    const selectedScriptsContent = savedScripts
      .filter(script => selectedScriptIds.has(script.id))
      .map(script => script.content);

    const combinedScripts = selectedScriptsContent.join('\n\n---\n\n');

    setError(null);
    setIsLoadingGeneration(true);
    setGeneratedScript('');

    try {
      const script = await generateScript(combinedScripts, newLesson);
      setGeneratedScript(script);
    } catch (e) {
      setError('حدث خطأ أثناء إنشاء النص الجديد. الرجاء المحاولة مرة أخرى.');
      console.error(e);
    } finally {
      setIsLoadingGeneration(false);
    }
  }, [savedScripts, selectedScriptIds, newLesson]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript);
  };
  
  const wordCount = newLesson.trim() === '' ? 0 : newLesson.trim().split(/\s+/).length;
  const generatedWordCount = generatedScript.trim() === '' ? 0 : generatedScript.trim().split(/\s+/).length;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-8 font-sans">
      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
          مولّد النصوص بالذكاء الاصطناعي
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
          درّب النموذج على أسلوبك في الكتابة، ثم زوّده بدرس جديد ليقوم بإنشاء نص بنفس طريقتك الفريدة.
        </p>
      </header>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6 w-full max-w-4xl" role="alert">
          <strong className="font-bold">خطأ: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StepCard
          stepNumber={1}
          title="التدريب والتحليل"
          icon={<BrainCircuitIcon />}
          isComplete={step1Complete}
        >
            {!step1Complete && (
            <div className="mb-6 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <h4 className="font-bold text-gray-200 mb-2">إضافة نص جديد للمكتبة</h4>
                <TextArea
                    value={newScriptContent}
                    onChange={(e) => setNewScriptContent(e.target.value)}
                    placeholder="الصق النص هنا لحفظه في مكتبتك..."
                    rows={6}
                    disabled={isLoadingAnalysis}
                />
                <Button
                    onClick={handleSaveScript}
                    disabled={!newScriptContent.trim() || isLoadingAnalysis}
                    className="mt-2 w-full text-sm"
                >
                    <SaveIcon className="w-4 h-4 mr-2" />
                    حفظ النص في المكتبة
                </Button>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="font-bold text-gray-200 flex items-center gap-2 mb-2">
              <LibraryIcon className="w-5 h-5 text-cyan-400" />
              مكتبة النصوص
            </h4>
            <p className="text-gray-400 text-sm mb-4 -mt-2">
                {step1Complete ? 'تم استخدام النصوص المحددة للتحليل.' : 'اختر النصوص التي تريد استخدامها في التحليل الحالي.'}
            </p>
            <div className="max-h-80 overflow-y-auto space-y-3 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
              {savedScripts.length > 0 ? (
                savedScripts.map((script) => (
                  <div key={script.id} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${selectedScriptIds.has(script.id) ? 'bg-cyan-900/30' : 'bg-gray-800/50'}`}>
                    <input
                      type="checkbox"
                      id={`script-${script.id}`}
                      checked={selectedScriptIds.has(script.id)}
                      onChange={() => handleToggleSelectScript(script.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-600 cursor-pointer"
                      disabled={step1Complete || isLoadingAnalysis}
                    />
                    <label htmlFor={`script-${script.id}`} className="flex-1 text-sm text-gray-300 cursor-pointer">
                      {script.content.substring(0, 200)}{script.content.length > 200 ? '...' : ''}
                    </label>
                    {!step1Complete && (
                        <button 
                            onClick={() => handleDeleteScript(script.id)}
                            className="p-1 rounded-full text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors"
                            aria-label="حذف النص"
                            disabled={isLoadingAnalysis}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">مكتبتك فارغة. أضف نصًا جديدًا للبدء.</p>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleAnalyzeStyle}
            isLoading={isLoadingAnalysis}
            disabled={step1Complete || selectedScriptIds.size === 0}
            className="w-full mt-6"
          >
            {step1Complete ? 'تم التحليل بنجاح' : `تحليل الأسلوب (${selectedScriptIds.size} نصوص محددة)`}
          </Button>

          {styleAnalysis && (
            <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <h4 className="font-bold text-cyan-400 flex items-center gap-2">
                <CheckIcon className="w-5 h-5" />
                خلاصة التحليل:
              </h4>
              <p className="text-gray-300 mt-2 text-sm">{styleAnalysis}</p>
            </div>
          )}
        </StepCard>

        <StepCard
          stepNumber={2}
          title="إنشاء النص الجديد"
          icon={<SparklesIcon />}
          isActive={step1Complete}
          isComplete={!!generatedScript}
        >
          <p className="text-gray-400 mb-4">
            الآن، الصق محتوى الدرس الجديد الذي تريد إنشاء نص له بنفس الأسلوب الذي تم تحليله.
          </p>
          <TextArea
            value={newLesson}
            onChange={(e) => setNewLesson(e.target.value)}
            placeholder="محتوى الدرس الجديد..."
            rows={10}
            disabled={!step1Complete || isLoadingGeneration}
          />
          <div className="text-left text-sm text-gray-400 mt-2 px-1">
            عدد الكلمات: {wordCount}
          </div>
          <Button
            onClick={handleGenerateScript}
            isLoading={isLoadingGeneration}
            disabled={!step1Complete || !newLesson.trim()}
            className="mt-4 w-full"
          >
            إنشاء النص
          </Button>

          {generatedScript && (
            <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-cyan-400">النص المُنشأ:</h4>
                <button 
                  onClick={handleCopyToClipboard}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 py-1 px-3 rounded-md transition-colors"
                >
                  نسخ
                </button>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{generatedScript}</p>
              <div className="text-left text-sm text-gray-400 mt-2 px-1">
                عدد الكلمات: {generatedWordCount}
              </div>
            </div>
          )}
        </StepCard>
      </main>
    </div>
  );
};

export default App;