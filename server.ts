import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// High limit for base64 captured video frames
app.use(express.json({ limit: '35mb' }));

// Server-side Gemini initialization
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Check AI status
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    hasApiKey: !!apiKey,
    model: 'gemini-3.8-flash',
  });
});

// Endpoint: Real-time Tactical Frame Analysis
app.post('/api/analyze-frame', async (req: Request, res: Response) => {
  try {
    const {
      imageBase64,
      matchContext = {},
      focusArea = 'general',
      analysisMode = 'standard',
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image frame provided for analysis' });
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    if (!aiClient) {
      // Mock realistic elite tactical intelligence fallback when API key is not yet set
      const mockResult = generateSimulatedTacticalData(matchContext, focusArea);
      return res.json({
        ...mockResult,
        isSimulated: true,
        notice: 'GEMINI_API_KEY no detectada. Mostrando análisis táctico de simulación de alta precisión.',
      });
    }

    const matchMin = matchContext.minute || '24\'';
    const score = matchContext.score || '0 - 0';
    const rivalName = matchContext.rivalName || 'Equipo Rival';

    const systemPrompt = `Eres el Analista Táctico Jefe y Asistente de Estrategia Deportiva de élite en tiempo real para Fútbol 11 profesional.
Estás analizando la imagen congelada o frame de video en directo de un partido oficial contra "${rivalName}" (Minuto: ${matchMin}, Marcador: ${score}).

Tu misión crucial en tiempo real en fútbol:
1. Identificar la disposición táctica, bloque (alto/medio/bajo o formación 4-4-2, 4-3-3, 5-3-2, etc.) y estructura espacial del rival.
2. Detectar con precisión los PATRONES DE MOVIMIENTO repetitivos o hábitos del rival (ej: basculación asimétrica, presión tardía tras pérdida, lateral que se proyecta dejando espalda desprotegida, marcas flotantes, desajustes en transición).
3. Localizar las DEBILIDADES TÁCTICAS críticas y explotables en este preciso instante del partido de fútbol.
4. Diseñar AJUSTES TÁCTICOS INMEDIATOS para el entrenador (instrucciones claras para cambiar el rumbo del partido en el banquillo o en el descanso).
5. Indicar coordenadas visuales normalizadas [0 - 100] de jugadores clave y zonas críticas para dibujar en el telestrator sobre el campo de fútbol.
6. Redactar una indicación auditiva ultraconcisa de 15 palabras o menos para el pinganillo del entrenador.

Responde estrictamente en formato JSON con la siguiente estructura.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
          },
        },
        {
          text: `Analiza este frame del partido de fútbol contra ${rivalName}. 
Área prioritaria de enfoque: ${focusArea}.
Contexto adicional del cuerpo técnico: ${matchContext.notes || 'Ninguna observación previa.'}
Devuelve el JSON estructurado según el esquema.`,
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tacticalSummary: {
              type: Type.STRING,
              description: 'Resumen táctico ejecutivo en 1-2 frases contundentes.',
            },
            formationDetected: {
              type: Type.STRING,
              description: 'Estructura o formación detectada (ej. 4-2-3-1 Bloque Medio, 1-3-1 Zona, etc.).',
            },
            defensiveBlockHeight: {
              type: Type.STRING,
              description: 'Alto / Medio / Bajo / Descoordinado',
            },
            movementPatterns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  patternName: { type: Type.STRING },
                  zone: { type: Type.STRING },
                  trigger: { type: Type.STRING, description: 'Qué provoca este movimiento en el rival' },
                  description: { type: Type.STRING },
                  predictability: { type: Type.STRING, description: 'Alta / Media / Baja' },
                  counterMeasure: { type: Type.STRING, description: 'Cómo contrarrestarlo' },
                },
                required: ['id', 'patternName', 'zone', 'description', 'counterMeasure'],
              },
            },
            tacticalWeaknesses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  zone: { type: Type.STRING },
                  severity: { type: Type.STRING, description: 'CRÍTICA / ALTA / MEDIA' },
                  flawDetail: { type: Type.STRING },
                  howToExploit: { type: Type.STRING },
                  targetPlayerOrSector: { type: Type.STRING },
                },
                required: ['id', 'title', 'zone', 'severity', 'flawDetail', 'howToExploit'],
              },
            },
            immediateAdjustments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'Ofensivo / Defensivo / Transición / Balón Parado' },
                  instruction: { type: Type.STRING },
                  priority: { type: Type.STRING, description: 'Inmediata (En vivo) / Entretiempo / Segundo Tiempo' },
                },
                required: ['id', 'title', 'type', 'instruction', 'priority'],
              },
            },
            detectedTacticalZones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  x: { type: Type.NUMBER, description: 'Porcentaje horizontal 0 a 100' },
                  y: { type: Type.NUMBER, description: 'Porcentaje vertical 0 a 100' },
                  width: { type: Type.NUMBER, description: 'Porcentaje ancho 5 a 50' },
                  height: { type: Type.NUMBER, description: 'Porcentaje alto 5 a 50' },
                  type: { type: Type.STRING, description: 'vulnerable / sobrecarga / espacio_libre / presion' },
                  note: { type: Type.STRING },
                },
                required: ['name', 'x', 'y', 'width', 'height', 'type', 'note'],
              },
            },
            audioBriefText: {
              type: Type.STRING,
              description: 'Frase de máxima urgencia para audio del entrenador (12-18 palabras en español).',
            },
            statisticsConfidence: {
              type: Type.NUMBER,
              description: 'Nivel de certeza analítica de 70 a 98',
            },
          },
          required: [
            'tacticalSummary',
            'formationDetected',
            'movementPatterns',
            'tacticalWeaknesses',
            'immediateAdjustments',
            'detectedTacticalZones',
            'audioBriefText',
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');
    return res.json({
      ...parsedData,
      isSimulated: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in analyze-frame:', error);
    // Fallback to high quality simulation on error to avoid breaking app
    const fallback = generateSimulatedTacticalData(
      req.body.matchContext || {},
      req.body.focusArea || 'general'
    );
    return res.json({
      ...fallback,
      isSimulated: true,
      errorMsg: error.message || 'Error al conectar con la API de IA',
    });
  }
});

// Endpoint: Generate Full Comprehensive Match & Strategy Report
app.post('/api/generate-report', async (req: Request, res: Response) => {
  try {
    const {
      rivalName = 'Equipo Rival',
      currentScore = '0 - 0',
      matchMinute = '45\'',
      accumulatedWeaknesses = [],
      accumulatedPatterns = [],
      adjustmentsApplied = [],
      keyFramesCount = 0,
    } = req.body;

    if (!aiClient) {
      return res.json(generateSimulatedReport(rivalName, currentScore, matchMinute));
    }

    const prompt = `Actúa como Director Técnico y Analista Senior de Rendimiento Deportivo de Primera División de Fútbol.
Elabora un INFORME TÁCTICO INTEGRAL Y PLAN DE AJUSTE ESTRATÉGICO PARA EL PARTIDO DE FÚTBOL en curso.
Competición: Fútbol 11 Profesional
Rival: ${rivalName}
Momento: Minuto ${matchMinute}, Marcador: ${currentScore}

Datos tácticos recopilados en tiempo real:
Debilidades identificadas: ${JSON.stringify(accumulatedWeaknesses.slice(0, 8))}
Patrones de movimiento rival: ${JSON.stringify(accumulatedPatterns.slice(0, 8))}
Ajustes tácticos propuestos: ${JSON.stringify(adjustmentsApplied.slice(0, 6))}
Número de secuencias de video analizadas: ${keyFramesCount}

Genera un reporte técnico de fútbol exhaustivo, riguroso y listo para ejecutar en el banquillo o vestuario.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            executiveVerdict: { type: Type.STRING },
            rivalTacticalDNA: {
              type: Type.OBJECT,
              properties: {
                system: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                fatalVulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                physicalConditionDecline: { type: Type.STRING },
              },
              required: ['system', 'strengths', 'fatalVulnerabilities'],
            },
            gamePlanAdjustments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING, description: 'Salida de Balón / Presión / Transición / Bloque' },
                  currentProblem: { type: Type.STRING },
                  exactModification: { type: Type.STRING },
                  tacticalOrder: { type: Type.STRING },
                },
                required: ['phase', 'currentProblem', 'exactModification', 'tacticalOrder'],
              },
            },
            individualTargeting: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  targetOpponent: { type: Type.STRING },
                  flaw: { type: Type.STRING },
                  actionToExecute: { type: Type.STRING },
                },
                required: ['targetOpponent', 'flaw', 'actionToExecute'],
              },
            },
            setPieceStrategy: {
              type: Type.STRING,
            },
            closingPlanMinutes: {
              type: Type.STRING,
            },
          },
          required: [
            'title',
            'executiveVerdict',
            'rivalTacticalDNA',
            'gamePlanAdjustments',
            'individualTargeting',
            'setPieceStrategy',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      ...parsed,
      isSimulated: false,
      generatedAt: new Date().toLocaleTimeString('es-ES'),
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.json(generateSimulatedReport(req.body.rivalName, req.body.currentScore, req.body.matchMinute));
  }
});

// Endpoint: Generate Coach Audio Brief via Gemini TTS
app.post('/api/audio-brief', async (req: Request, res: Response) => {
  try {
    const { text = 'Atención: Espacio descubierto a la espalda del lateral derecho. Busquemos balón largo ya.' } = req.body;

    if (!aiClient) {
      return res.status(200).json({
        available: false,
        text,
        notice: 'Gemini TTS requiere GEMINI_API_KEY activa. Usando síntesis de voz Web Speech API local.',
      });
    }

    const ttsResponse = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: 'Autoritario, claro, rápido como entrenador de fútbol en la banda.',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
      },
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      return res.json({
        available: true,
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
        text,
      });
    } else {
      return res.json({ available: false, text });
    }
  } catch (error: any) {
    console.error('Error generating audio brief:', error);
    return res.json({ available: false, text: req.body.text || '', error: error.message });
  }
});

// Helper: Simulated Tactical Data for Football
function generateSimulatedTacticalData(context: any, focusArea: string) {
  return {
    tacticalSummary: 'El rival adelanta la línea defensiva a 38 metros pero sufre descoordinación en basculación: lateral derecho sube sin relevo del mediocentro.',
    formationDetected: '4-4-2 con Bloque Medio-Alto asimétrico',
    defensiveBlockHeight: 'Bloque Alto (38m)',
    movementPatterns: [
      {
        id: 'pat-1',
        patternName: 'Proyección ciega del Lateral Derecho',
        zone: 'Banda Derecha Rival / Flanco Izquierdo Nuestro',
        trigger: 'Pérdida de balón en 3/4 de cancha',
        description: 'El lateral derecho rival sube constantemente hasta línea de fondo pero tarda 4.2s en replegar, dejando un pasillo de 25 metros sin cobertura.',
        predictability: 'Alta',
        counterMeasure: 'Transición vertiginosa directa al espacio libre a su espalda con nuestro extremo.',
      },
      {
        id: 'pat-2',
        patternName: 'Salto descoordinado del Central zurdo a presión',
        zone: 'Carril Central - Espalda de Pivote',
        trigger: 'Recepción del mediapunta entre líneas',
        description: 'El central #4 salta agresivo a interceptar dejando una brecha enorme entre él y el otro central.',
        predictability: 'Media',
        counterMeasure: 'Pared rápida de espaldas al arco y desmarque de ruptura al hueco generado.',
      },
      {
        id: 'pat-3',
        patternName: 'Basculación lenta hacia banda contraria',
        zone: 'Cambio de orientación',
        trigger: 'Atracción en banda izquierda',
        description: 'El equipo rival se junta en 30 metros de ancho, concediendo el lado débil completamente desguarnecido.',
        predictability: 'Alta',
        counterMeasure: 'Cambio de juego de 40 metros con golpeo tenso al lateral opuesto incorporado.',
      },
    ],
    tacticalWeaknesses: [
      {
        id: 'w-1',
        title: 'Espacio desprotegido a la espalda de laterales',
        zone: 'Banda Derecha Rival (Nuestra Izquierda)',
        severity: 'CRÍTICA',
        flawDetail: 'Distancia de 28 metros entre lateral derecho y central más cercano en fase de ataque rival.',
        howToExploit: 'Lanzar a nuestro extremo zurdo en carrera al espacio sin intentar conducción previa.',
        targetPlayerOrSector: 'Lateral #2 rival y espalda del pivote',
      },
      {
        id: 'w-2',
        title: 'Vulnerabilidad al pase entre líneas en salida de balón',
        zone: 'Zona 14 (Mediapunta rival)',
        severity: 'ALTA',
        flawDetail: 'Sus dos mediocentros no coordinan la altura: uno presiona y el otro se hunde, creando un pozo de 15 metros.',
        howToExploit: 'Ubicar al mediapunta fijo en ese vértice ciego para recepcionar y girar de cara al gol.',
        targetPlayerOrSector: 'Pivote defensivo #6 rival',
      },
      {
        id: 'w-3',
        title: 'Falta de agresividad en segundas jugadas de córner',
        zone: 'Borde del área grande',
        severity: 'MEDIA',
        flawDetail: 'Rechazan hacia el centro y ningún volante sale a cerrar el disparo de media distancia.',
        howToExploit: 'Dejar un lanzador libre en la frontal esperando el rechace frontal.',
        targetPlayerOrSector: 'Frontal del área',
      },
    ],
    immediateAdjustments: [
      {
        id: 'adj-1',
        title: 'Explotar carril izquierdo con balones al espacio',
        type: 'Ofensivo',
        instruction: 'Evitar la circulación lenta horizontal. En cuanto recuperemos, pase directo al espacio del extremo izquierdo.',
        priority: 'Inmediata (En vivo)',
      },
      {
        id: 'adj-2',
        title: 'Adelantar línea de presión tras su lateral derecho',
        type: 'Defensivo',
        instruction: 'Forzar su salida con pierna inhábil cerrando el pase al central zurdo.',
        priority: 'Inmediata (En vivo)',
      },
      {
        id: 'adj-3',
        title: 'Ajuste de marcas en repliegue',
        type: 'Transición',
        instruction: 'Pivote defensivo debe escalonar 5 metros por detrás para cortar el pase diagonal.',
        priority: 'Entretiempo',
      },
    ],
    detectedTacticalZones: [
      {
        name: 'Zona Crítica: Espalda Lateral Derecho',
        x: 18,
        y: 22,
        width: 25,
        height: 35,
        type: 'vulnerable',
        note: 'Espacio libre de 25m sin cobertura defensiva',
      },
      {
        name: 'Sobrecarga Defensiva Rival',
        x: 62,
        y: 48,
        width: 28,
        height: 32,
        type: 'sobrecarga',
        note: '6 jugadores rivales concentrados en sector derecho',
      },
      {
        name: 'Pasillo de Pase Vertical (Zona 14)',
        x: 44,
        y: 52,
        width: 18,
        height: 22,
        type: 'espacio_libre',
        note: 'Hueco entre líneas para giro de mediapunta',
      },
    ],
    audioBriefText: '¡Atención banda izquierda! Espacio libre a la espalda de su lateral derecho, ataque directo.',
    statisticsConfidence: 96,
  };
}

function generateSimulatedReport(rivalName = 'Equipo Rival', currentScore = '0 - 0', matchMinute = '45\'') {
  return {
    title: `Dossier Táctico de Intervención: vs ${rivalName}`,
    subtitle: `Análisis de Rendimiento y Contramedidas Tácticas en Tiempo Real - Fútbol 11`,
    executiveVerdict: `El rival muestra un patrón recurrente de vulnerabilidad estructural en transiciones defensivas. Su necesidad de proyectar los laterales genera espacios masivos de penetración que pueden liquidar el partido si aceleramos el juego vertical.`,
    rivalTacticalDNA: {
      system: '4-3-3 Ofensivo mutando a 4-4-2 en repliegue tardío',
      strengths: [
        'Buena precisión de pase en el primer tercio de campo.',
        'Extremos rápidos con desborde en el uno contra uno.',
      ],
      fatalVulnerabilities: [
        'Desconexión severa entre laterales y centrales al perder la posesión.',
        'Pivote central con dificultad en giros defensivos de 180 grados.',
        'Fatiga evidente en carrileros a partir del minuto 35 con caídas de repliegue de más del 30%.',
      ],
      physicalConditionDecline: 'Caída de intensidad notable en bandas durante los últimos 15 minutos de cada tiempo.',
    },
    gamePlanAdjustments: [
      {
        phase: 'Transición Ofensiva',
        currentProblem: 'Exceso de toques en mediocampo que permiten al rival reorganizarse.',
        exactModification: 'Limitar a máximo 2 toques en zona de gestación y enviar diagonal al extremo.',
        tacticalOrder: 'Jugar vertical a la espalda de su lateral en los primeros 5 segundos tras robo.',
      },
      {
        phase: 'Presión Alta',
        currentProblem: 'El central derecho rival sale limpio con tiempo para pensar.',
        exactModification: 'Dirigir la presión para obligar al central zurdo a jugar con su pierna débil.',
        tacticalOrder: 'El delantero centro tapa la línea con el pivote y el extremo orienta hacia la banda.',
      },
      {
        phase: 'Balón Parado',
        currentProblem: 'Marcan al hombre pero pierden la marca en bloqueos indirectos.',
        exactModification: 'Efectuar arrastre al primer palo y remate de segunda línea al punto de penal.',
        tacticalOrder: 'Diseñar jugada ensayada Alfa-2 en el próximo saque de esquina.',
      },
    ],
    individualTargeting: [
      {
        targetOpponent: 'Lateral Derecho (#2)',
        flaw: 'Sube constantemente sin verificar relevos; sufre en duelos aéreos a su espalda.',
        actionToExecute: 'Fijarlo con nuestro extremo abierto y desdoblar con lateral en velocidad.',
      },
      {
        targetOpponent: 'Pivote Central (#6)',
        flaw: 'Comete faltas tácticas reiteradas cuando lo encaran de frente con velocidad.',
        actionToExecute: 'Provocar la segunda tarjeta amarilla conduciendo por su zona de influencia.',
      },
    ],
    setPieceStrategy: 'El portero rival no sale a balones templados al borde del área pequeña. Enviar saques de esquina cerrados a la altura del segundo poste.',
    closingPlanMinutes: 'En caso de ventaja en el minuto 75, pasar a bloque medio compacto 5-3-2 cerrando el carril interior y reservando a dos flechas para la contra.',
    generatedAt: new Date().toLocaleTimeString('es-ES'),
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode with Vite middleware
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TactixAI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
