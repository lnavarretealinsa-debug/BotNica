
import React, { useState, useEffect, useRef } from 'react';
import { FAQItem } from '../types';
import { ADMIN_PASSWORD } from '../constants';
import { PlusIcon, TrashIcon, PencilIcon, UploadIcon } from './icons/Icons';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

interface AdminViewProps {
  faqData: FAQItem[];
  setFaqData: React.Dispatch<React.SetStateAction<FAQItem[]>>;
  systemPrompt: string;
  setSystemPrompt: React.Dispatch<React.SetStateAction<string>>;
}

const AdminView: React.FC<AdminViewProps> = ({ faqData, setFaqData, systemPrompt, setSystemPrompt }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  
  const [prompt, setLocalPrompt] = useState(systemPrompt);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalPrompt(systemPrompt);
  }, [systemPrompt]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta.');
    }
  };

  const handleAddOrUpdateFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error('La pregunta y la respuesta no pueden estar vacías.');
      return;
    };
    
    if (editingFaq) {
      setFaqData(faqData.map(item => item.id === editingFaq.id ? { ...item, question: newQuestion, answer: newAnswer } : item));
      toast.success('Pregunta actualizada con éxito.');
    } else {
      const newItem: FAQItem = {
        id: `faq-${Date.now()}`,
        question: newQuestion,
        answer: newAnswer,
      };
      setFaqData([...faqData, newItem]);
      toast.success('Nueva pregunta añadida.');
    }
    resetForm();
  };

  const handleEdit = (item: FAQItem) => {
    setEditingFaq(item);
    setNewQuestion(item.question);
    setNewAnswer(item.answer);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-4">
        <p>¿Estás seguro de que quieres eliminar esta pregunta?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFaqData(faqData.filter(item => item.id !== id));
              toast.dismiss(t.id);
              toast.success('Pregunta eliminada.');
            }}
            className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-500 transition-colors"
          >
            Eliminar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
    });
  };
  
  const resetForm = () => {
    setEditingFaq(null);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handlePromptSave = () => {
    setSystemPrompt(prompt);
    toast.success('System prompt guardado con éxito.');
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const newFaqs: FAQItem[] = json
          .filter(row => row[0] && row[1]) 
          .map((row, index) => ({
            id: `faq-import-${Date.now()}-${index}`,
            question: String(row[0]),
            answer: String(row[1]),
          }));

        if (newFaqs.length > 0) {
           toast((t) => (
              <div className="flex flex-col gap-4">
                <p>{`Se encontraron ${newFaqs.length} preguntas. ¿Deseas añadirlas?`}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setFaqData(prev => [...prev, ...newFaqs]);
                      toast.dismiss(t.id);
                      toast.success('¡Importación exitosa!');
                    }}
                    className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-500 transition-colors"
                  >
                    Añadir
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                     className="w-full bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ));
        } else {
          toast.error('No se encontraron preguntas válidas en el archivo.');
        }
      } catch (err) {
        console.error("Error parsing Excel file:", err);
        toast.error('Error al procesar el archivo Excel.');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsArrayBuffer(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-slate-800 p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Acceso de Administrador</h2>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 transition-colors">
            Ingresar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 bg-slate-900 custom-scrollbar text-slate-200">
      <div className="max-w-4xl mx-auto">
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Editor de System Prompt</h2>
          <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
            <textarea
              value={prompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              className="w-full h-48 bg-slate-900 text-slate-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent resize-y"
              aria-label="System Prompt"
            />
            <div className="mt-4 text-right">
                <button onClick={handlePromptSave} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-500 transition-colors">
                    Guardar Prompt
                </button>
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Gestionar Preguntas Frecuentes (FAQ)</h2>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-500 transition-colors"
                title="Importar desde archivo .xlsx"
            >
                <UploadIcon />
                <span className="hidden sm:inline">Importar desde Excel</span>
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".xlsx, .xls"
                className="hidden"
            />
          </div>

          <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-semibold mb-4">{editingFaq ? 'Editar' : 'Añadir'} Pregunta</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Pregunta"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
              />
              <textarea
                placeholder="Respuesta"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={4}
                className="w-full bg-slate-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent resize-y"
              />
            </div>
            <div className="mt-4 flex gap-4">
              <button onClick={handleAddOrUpdateFaq} className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-500 transition-colors">
                <PlusIcon /> {editingFaq ? 'Actualizar' : 'Añadir'}
              </button>
              {editingFaq && (
                <button onClick={resetForm} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500 transition-colors">
                  Cancelar
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            {faqData.map((item) => (
              <div key={item.id} className="bg-slate-800 p-4 rounded-lg shadow-md flex justify-between items-start">
                <div className="flex-1 mr-4">
                  <p className="font-bold text-blue-300">{item.question}</p>
                  <p className="text-slate-400 mt-1">{item.answer}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(item)} className="p-2 rounded-full hover:bg-slate-700 text-yellow-400" aria-label="Edit">
                    <PencilIcon />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-full hover:bg-slate-700 text-red-400" aria-label="Delete">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminView;
