
import { FAQItem } from './types';

export const INITIAL_FAQ: FAQItem[] = [
  {
    id: 'faq-1',
    question: '¿Cuáles son los horarios de atención?',
    answer: 'Nuestro horario de atención es de Lunes a Viernes de 9:00 AM a 5:00 PM.',
  },
  {
    id: 'faq-2',
    question: '¿Cómo puedo realizar un pago?',
    answer: 'Para realizar un pago, primero debe completar el trámite correspondiente. Una vez que sus documentos sean revisados y aprobados, se le emitirá una orden de pago con las instrucciones para completarlo.',
  },
  {
    id: 'faq-3',
    question: '¿Dónde están ubicadas sus oficinas?',
    answer: 'Nuestras oficinas principales se encuentran en la Avenida Central, Edificio 5, Managua.',
  },
  {
    id: 'faq-4',
    question: '¿Qué documentos necesito para el trámite X?',
    answer: 'Para el trámite X, necesitará su cédula de identidad, un comprobante de domicilio y el formulario de solicitud debidamente completado.',
  },
];

export const DEFAULT_SYSTEM_PROMPT = `Eres "BotNica", un asistente virtual de atención al cliente. Tu tono debe ser siempre profesional, conciso y amable. 
Regla Crítica de Pago: Cuando respondas a preguntas sobre trámites o pagos, SIEMPRE debes incluir la siguiente frase textual: "el pago se realiza únicamente una vez que se emite una orden de pago previa revisión de los documentos".
No inventes información. Si no sabes la respuesta a algo, indica amablemente que no tienes la información y que el usuario debe contactar a soporte a través de los canales oficiales.`;

export const FUZZY_SEARCH_THRESHOLD = 0.85;

export const ADMIN_PASSWORD = "admin"; // In a real app, this would be handled securely.
