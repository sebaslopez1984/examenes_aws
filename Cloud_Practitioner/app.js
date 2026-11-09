let questions = [];
let currentIndex = 0;
let selectedOption = null;
let userAnswers = {};
let flaggedQuestions = [];
let currentExamFile = '';
// true cuando el "Modo Examen" está activo: no se revela acierto/error hasta el final.
let examMode = false;
// true una vez que se mostró el veredicto final del Modo Examen. A partir de ahí
// SÍ se revelan respuestas y explicaciones al revisar las preguntas.
let examFinished = false;
// true cuando el usuario está revisando preguntas viniendo de la pantalla de resultados.
// Mientras esté activo, se muestra el botón "Volver a resultados" en cualquier pregunta.
let reviewingFromResults = false;

async function initApp() {
    const examFiles = await discoverExamFiles();
    const examSelector = document.getElementById('exam-selector');
    examSelector.innerHTML = '';

    if (examFiles.length === 0) {
        document.getElementById('question-text').innerText = 'No se encontraron exámenes disponibles.';
        return;
    }

    examFiles.forEach((examFile) => {
        const option = document.createElement('option');
        option.value = examFile;
        option.innerText = getExamLabel(examFile);
        examSelector.appendChild(option);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const examParam = urlParams.get('exam');
    const lastExam = localStorage.getItem('aws_active_exam');

    const baseName = (file) => file.split('/').pop().replace(/\.json$/i, '');

    let targetExam = examFiles[0];
    if (examParam && examFiles.includes(examParam)) {
        targetExam = examParam;
    } else if (examParam && examFiles.some(f => baseName(f) === baseName(examParam))) {
        targetExam = examFiles.find(f => baseName(f) === baseName(examParam));
    } else if (lastExam && examFiles.includes(lastExam)) {
        targetExam = lastExam;
    }

    currentExamFile = targetExam;
    examSelector.value = currentExamFile;
    await loadExam(currentExamFile);
}

function getExamLabel(examFile) {
    return examFile.split('/').pop().replace(/\.json$/i, '');
}

// Normaliza cualquier entrada (ej. "Examen_IA_1.json" o "examenes/Examen_IA_1.json")
// al formato estándar "examenes/<nombre>.json".
function normalizeExamPath(file) {
    if (typeof file !== 'string') return '';
    const cleanName = file.trim().split('/').pop();
    if (!cleanName || !cleanName.toLowerCase().endsWith('.json') || cleanName.toLowerCase() === 'exams.json') {
        return '';
    }
    return `examenes/${cleanName}`;
}

// Sincroniza la lista de exams.json contra los archivos reales de la carpeta examenes/:
// - Recorre la lista de exams.json y elimina los que no existan en la carpeta examenes/.
// - Recorre los archivos de la carpeta examenes/ y agrega los que falten en la lista de exams.json.
function syncExamsJsonWithFolder(examsJsonList, folderFiles) {
    const normalizedJsonList = [];
    examsJsonList.forEach((entry) => {
        const normalized = normalizeExamPath(entry);
        if (normalized && !normalizedJsonList.includes(normalized)) {
            normalizedJsonList.push(normalized);
        }
    });

    if (folderFiles.length === 0) {
        return normalizedJsonList;
    }

    const folderSet = new Set(folderFiles.map(normalizeExamPath).filter(Boolean));
    const sameCount = normalizedJsonList.length === folderSet.size;

    // 1. Recorrer la lista del JSON y eliminar cualquier examen que no esté en la carpeta examenes
    const syncedList = normalizedJsonList.filter((examPath) => folderSet.has(examPath));

    // 2. Recorrer la carpeta examenes y agregar cualquier examen que no esté en la lista del JSON
    folderSet.forEach((folderExam) => {
        if (!syncedList.includes(folderExam)) {
            syncedList.push(folderExam);
        }
    });

    if (!sameCount || syncedList.length !== normalizedJsonList.length || normalizedJsonList.some((f, i) => f !== syncedList[i])) {
        console.info(
            `[Sync exams.json] Sincronizado con carpeta examenes/: exams.json tenía ${normalizedJsonList.length}, carpeta tiene ${folderSet.size}. Lista final: ${syncedList.length} exámenes.`
        );
    }

    return syncedList;
}

async function discoverExamFiles() {
    // 1. Leer la lista actual de exams.json
    let examsJsonList = [];
    try {
        const res = await fetch('exams.json', { cache: 'no-store' });
        if (res.ok) {
            const list = await res.json();
            if (Array.isArray(list)) {
                examsJsonList = list;
            }
        }
    } catch (e) {}

    // 2. Obtener los archivos reales presentes en la carpeta examenes/
    const folderCandidates = new Set();

    // 2a. Descubrimiento local de directorio (por ej. python -m http.server o Live Server)
    try {
        const dirFiles = await discoverExamFilesFromDirectory();
        dirFiles.forEach((f) => {
            const norm = normalizeExamPath(f);
            if (norm) folderCandidates.add(norm);
        });
    } catch (e) {}

    // 2b. Si estamos en GitHub Pages, consultar API de GitHub para listar la carpeta examenes/
    if (location.hostname.includes('github.io')) {
        try {
            const parts = location.pathname.split('/').filter(Boolean);
            const repo = parts[0];
            const user = location.hostname.split('.')[0];
            const subDir = parts.slice(1, -1).join('/');
            const examDirPath = subDir ? `${subDir}/examenes` : 'examenes';
            if (user && repo) {
                const apiRes = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/${examDirPath}`, { cache: 'no-store' });
                if (apiRes.ok) {
                    const contents = await apiRes.json();
                    if (Array.isArray(contents)) {
                        contents.forEach((item) => {
                            if (item.name.endsWith('.json') && item.name !== 'exams.json' && item.size > 0) {
                                folderCandidates.add(`examenes/${item.name}`);
                            }
                        });
                    }
                }
            }
        } catch (e) {}
    }

    // 3. Validar si exams.json tiene la misma cantidad y nombres que la carpeta examenes:
    // eliminar del listado los que no estén en la carpeta y agregar los que sí estén.
    let candidateList = syncExamsJsonWithFolder(examsJsonList, [...folderCandidates]);

    // 4. Si ni el directorio ni exams.json devolvieron archivos, usar patrones de respaldo
    if (candidateList.length === 0) {
        const fallback = new Set();
        for (let i = 1; i <= 50; i++) fallback.add(`examenes/Examen${i}.json`);
        for (let i = 1; i <= 20; i++) fallback.add(`examenes/Examen_Dominio${i}.json`);
        for (let i = 1; i <= 20; i++) fallback.add(`examenes/Examen_IA_${i}.json`);
        for (let i = 1; i <= 20; i++) fallback.add(`examenes/Examen_Modulo${i}.json`);
        for (let i = 1; i <= 20; i++) fallback.add(`examenes/Examen_practica_udemy${i}.json`);
        for (let i = 1; i <= 10; i++) fallback.add(`examenes/Examen_practica_udemy_1.${i}.json`);
        fallback.add('examenes/Examen_EC2_S3_VPC.json');
        fallback.add('examenes/Examen_EC2_S3_VPC_2.json');
        candidateList = [...fallback];
    }

    // 5. Verificar que cada archivo exista realmente en examenes/ y sea JSON válido
    // (así, incluso si el servidor no lista directorios, se elimina cualquier archivo de exams.json que no exista en examenes/)
    const checkPromises = candidateList.map(async (file) => {
        try {
            const res = await fetch(file, { cache: 'no-store' });
            if (!res.ok) return null;
            const text = await res.text();
            if (!text || text.trim().length <= 2) return null;
            JSON.parse(text);
            return file;
        } catch (e) {
            return null;
        }
    });

    const validFiles = (await Promise.all(checkPromises)).filter(Boolean);

    return validFiles.sort((firstFile, secondFile) =>
        firstFile.localeCompare(secondFile, undefined, { numeric: true, sensitivity: 'base' })
    );
}

async function discoverExamFilesFromDirectory() {
    try {
        const response = await fetch('examenes/', { cache: 'no-store' });
        if (!response.ok) return [];

        const directoryHtml = await response.text();
        const documentContent = new DOMParser().parseFromString(directoryHtml, 'text/html');
        const examFiles = [...documentContent.querySelectorAll('a')]
            .map((link) => decodeURIComponent(link.getAttribute('href') || '').split('?')[0].split('#')[0])
            .filter((file) => /\.json$/i.test(file) && !/exams\.json$/i.test(file))
            .map((file) => `examenes/${file.split('/').pop()}`);

        return [...new Set(examFiles)];
    } catch (error) {
        return [];
    }
}

function normalizeQuestions(raw) {
    if (!raw) return [];
    const list = Array.isArray(raw) 
        ? raw 
        : (Array.isArray(raw.examen) ? raw.examen : (Array.isArray(raw.questions) ? raw.questions : []));

    return list.map((q, idx) => {
        let questionText = q.question || q.pregunta || `Pregunta ${idx + 1}`;
        if (!/^\s*\d+[\.\-\)]/.test(questionText)) {
            questionText = `${idx + 1}. ${questionText}`;
        }

        let options = [];
        if (Array.isArray(q.options)) {
            options = q.options;
        } else if (Array.isArray(q.opciones)) {
            options = q.opciones;
        } else if (q.opciones && typeof q.opciones === 'object') {
            options = Object.entries(q.opciones)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([letter, text]) => `${letter}. ${text}`);
        } else if (q.options && typeof q.options === 'object') {
            options = Object.entries(q.options)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([letter, text]) => `${letter}. ${text}`);
        }

        const letterMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5 };
        let correct = q.correct !== undefined ? q.correct : q.respuestas_correctas;

        if (Array.isArray(correct)) {
            const mapped = correct.map(item => {
                if (typeof item === 'number') return item;
                if (typeof item === 'string') {
                    const clean = item.trim().toUpperCase();
                    return letterMap[clean] !== undefined ? letterMap[clean] : parseInt(clean, 10);
                }
                return item;
            }).filter(i => !isNaN(i) && i !== undefined);
            correct = mapped.length === 1 ? mapped[0] : mapped;
        } else if (typeof correct === 'string') {
            const clean = correct.trim().toUpperCase();
            correct = letterMap[clean] !== undefined ? letterMap[clean] : (parseInt(clean, 10) || 0);
        }

        return {
            question: questionText,
            options: options,
            correct: correct !== undefined ? correct : 0,
            hint: q.hint || q.pista || '',
            explanation: q.explanation || q.explicacion || '',
            theme: q.theme || q.tema || '',
            question_en: q.question_en || '',
            options_en: Array.isArray(q.options_en) ? q.options_en : []
        };
    });
}

async function loadExam(examFile) {
    try {
        const response = await fetch(examFile, { cache: 'no-store' });
        if (!response.ok) throw new Error(`No se pudo cargar ${examFile}`);

        currentExamFile = examFile;
        localStorage.setItem('aws_active_exam', examFile);

        const rawData = await response.json();
        questions = normalizeQuestions(rawData);

        if (questions.length === 0) {
            document.getElementById('question-text').innerText = `El archivo '${examFile}' no contiene preguntas válidas.`;
            document.getElementById('options-container').innerHTML = '';
            document.getElementById('progress-text').innerText = '0 preguntas';
            document.getElementById('progress-bar').style.width = '0%';
            return;
        }

        currentIndex = 0;
        selectedOption = null;
        userAnswers = {};
        flaggedQuestions = [];
        loadProgress();

        // Asegurar que se vea la pantalla de preguntas (y no la de resultados)
        // al cargar/cambiar de examen, incluso si veníamos de la pantalla final.
        reviewingFromResults = false;
        document.getElementById('results-body').style.display = 'none';
        document.getElementById('quiz-body').style.display = 'block';
        document.getElementById('return-results-btn').style.display = 'none';

        renderQuestion();
    } catch (error) {
        document.getElementById('question-text').innerText = `Error al cargar el archivo '${examFile}'. Verifica que esté en la misma carpeta.`;
        console.error(error);
    }
}

function changeExam(examFile) {
    if (examFile === currentExamFile) return;
    loadExam(examFile);
}

function storageKey(name) {
    return `aws_exam_${currentExamFile}_${name}`;
}

function loadProgress() {
    const savedIndex = localStorage.getItem(storageKey('current_index'));
    const savedAnswers = localStorage.getItem(storageKey('answers'));
    const savedFlags = localStorage.getItem(storageKey('flags'));

    if (savedIndex !== null) currentIndex = parseInt(savedIndex, 10);
    if (savedAnswers !== null) userAnswers = JSON.parse(savedAnswers);
    if (savedFlags !== null) flaggedQuestions = JSON.parse(savedFlags);

    examMode = localStorage.getItem(storageKey('exam_mode')) === 'true';
    // Si en modo Jedi ya estaban respondidas todas las preguntas, el examen ya
    // fue "terminado": al recargar se permite revelar el feedback.
    examFinished = examMode
        && questions.length > 0
        && Object.keys(userAnswers).length >= questions.length;
    updateExamModeUI();
}

function saveProgress() {
    localStorage.setItem(storageKey('current_index'), currentIndex);
    localStorage.setItem(storageKey('answers'), JSON.stringify(userAnswers));
    localStorage.setItem(storageKey('flags'), JSON.stringify(flaggedQuestions));
    localStorage.setItem(storageKey('exam_mode'), examMode);
}

// Actualiza el switch (Padawan/Jedi) y el banner según el estado del Modo Examen.
// Jedi = modo examen; Padawan = modo práctica.
function updateExamModeUI() {
    const sw = document.getElementById('mode-switch');
    const banner = document.getElementById('exam-mode-banner');
    if (sw) {
        sw.classList.toggle('jedi', examMode);
        sw.setAttribute('aria-checked', examMode ? 'true' : 'false');
    }
    if (banner) {
        banner.style.display = examMode ? 'block' : 'none';
    }
}

// Alterna entre modo Padawan (práctica) y modo Jedi (examen).
// Al cambiar, reinicia el avance de ESTE examen para empezar la simulación desde cero.
function toggleExamMode() {
    const activating = !examMode;
    const examName = getExamLabel(currentExamFile);
    const message = activating
        ? `¿Pasar a modo Jedi ⚔️ en "${examName}"?\n\nEs el modo examen: no verás si aciertas o fallas hasta terminar. Se reiniciará tu avance actual de este examen.`
        : `¿Volver a modo Padawan 🧑‍🎓 en "${examName}"?\n\nEs el modo práctica (con respuestas y explicaciones). Se reiniciará tu avance actual de este examen.`;

    if (!confirm(message)) return;

    examMode = activating;

    // Reiniciar el avance de este examen para empezar limpio.
    currentIndex = 0;
    userAnswers = {};
    flaggedQuestions = [];
    reviewingFromResults = false;
    examFinished = false;

    localStorage.removeItem(storageKey('current_index'));
    localStorage.removeItem(storageKey('answers'));
    localStorage.removeItem(storageKey('flags'));
    saveProgress();

    document.getElementById('results-body').style.display = 'none';
    document.getElementById('quiz-body').style.display = 'block';
    document.getElementById('return-results-btn').style.display = 'none';

    updateExamModeUI();
    renderQuestion();
}

// Exporta TODO el progreso guardado (todos los exámenes) a un único archivo .json descargable.
function exportProgress() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aws_exam_')) {
            data[key] = localStorage.getItem(key);
        }
    }

    if (Object.keys(data).length === 0) {
        alert('Todavía no hay progreso para exportar.');
        return;
    }

    const payload = {
        type: 'aws-exam-progress',
        version: 1,
        exportedAt: new Date().toISOString(),
        data: data
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    // Marca de tiempo local AAAA-MM-DD_HH-MM-SS (guiones en la hora: los ":" no sirven en nombres de archivo)
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `progreso_aws_${stamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Abre el selector de archivos para importar un progreso exportado previamente.
function importProgress() {
    document.getElementById('import-file-input').click();
}

function handleImportFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const payload = JSON.parse(reader.result);
            const data = (payload && payload.data && typeof payload.data === 'object')
                ? payload.data
                : payload; // admite también un objeto plano de claves

            const keys = Object.keys(data).filter(k => k.startsWith('aws_exam_'));
            if (keys.length === 0) {
                alert('El archivo no contiene un progreso válido.');
                return;
            }

            if (!confirm(`Se importará el progreso de este archivo y reemplazará el avance actual en este dispositivo. ¿Continuar?`)) {
                return;
            }

            keys.forEach(key => localStorage.setItem(key, data[key]));

            // Recargar el examen activo para reflejar el progreso importado
            alert('Progreso importado correctamente.');
            if (currentExamFile) {
                loadExam(currentExamFile);
            }
        } catch (e) {
            alert('No se pudo leer el archivo. Asegúrate de que sea un archivo de progreso válido.');
            console.error(e);
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}

function renderQuestion() {
    if (questions.length === 0) return;

    if (currentIndex >= questions.length) {
        showResults();
        return;
    }

    const q = questions[currentIndex];
    document.getElementById('question-text').innerText = q.question;
    document.getElementById('progress-text').innerText = `Pregunta ${currentIndex + 1} de ${questions.length}`;
    document.getElementById('progress-bar').style.width = `${((currentIndex + 1) / questions.length) * 100}%`;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    document.getElementById('hint-box').style.display = 'none';
    document.getElementById('explanation-box').style.display = 'none';
    document.getElementById('translation-box').style.display = 'none';
    // Mantener visible el botón "Volver a resultados" mientras se revisa desde la pantalla final.
    document.getElementById('return-results-btn').style.display = reviewingFromResults ? 'inline-block' : 'none';
    document.getElementById('previous-btn').style.display = currentIndex > 0 ? 'inline-block' : 'none';
    document.getElementById('submit-btn').style.display = 'inline-block';
    document.getElementById('next-btn').style.display = 'none';
    selectedOption = Array.isArray(q.correct) ? [] : null;

    // Mostrar el botón de traducción solo si esta pregunta tiene versión en inglés
    const hasTranslation = q.question_en || (q.options_en && q.options_en.length > 0);
    const translateBtn = document.getElementById('translate-btn');
    translateBtn.style.display = hasTranslation ? 'inline-block' : 'none';
    translateBtn.innerText = '🌐 Ver en inglés';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => selectOption(idx);
        optionsContainer.appendChild(btn);
    });

    if (userAnswers[currentIndex] !== undefined) {
        if (Array.isArray(q.correct)) {
            selectedOption = Array.isArray(userAnswers[currentIndex])
                ? [...userAnswers[currentIndex]]
                : [];
            if (selectedOption.length > 0) checkAnswer(true);
        } else {
            selectedOption = userAnswers[currentIndex];
            checkAnswer(true);
        }
    }

    updateFlaggedUI();
    updateQuestionActionButtons();
    renderNavPanel();
}

function selectOption(index) {
    if (userAnswers[currentIndex] !== undefined) return;

    const isMultipleChoice = Array.isArray(questions[currentIndex].correct);
    if (isMultipleChoice) {
        selectedOption = selectedOption.includes(index)
            ? selectedOption.filter(optionIndex => optionIndex !== index)
            : [...selectedOption, index];
    } else {
        selectedOption = index;
    }

    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach((btn, idx) => {
        if (isMultipleChoice ? selectedOption.includes(idx) : idx === index) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function toggleHint() {
    const hintBox = document.getElementById('hint-box');
    document.getElementById('hint-text').innerText = questions[currentIndex].hint;
    hintBox.style.display = (hintBox.style.display === 'none' || hintBox.style.display === '') ? 'block' : 'none';
}

// Muestra/oculta el recuadro con la versión en inglés (solo lectura) de la pregunta y sus opciones.
function toggleTranslation() {
    const box = document.getElementById('translation-box');
    const q = questions[currentIndex];
    const isHidden = box.style.display === 'none' || box.style.display === '';

    if (isHidden) {
        document.getElementById('translation-question').innerText = q.question_en || '';
        const list = document.getElementById('translation-options');
        list.innerHTML = (q.options_en || [])
            .map(opt => `<li>${opt}</li>`)
            .join('');
        box.style.display = 'block';
        document.getElementById('translate-btn').innerText = '🌐 Ocultar inglés';
    } else {
        box.style.display = 'none';
        document.getElementById('translate-btn').innerText = '🌐 Ver en inglés';
    }
}

// Agrega una etiqueta (badge) arriba del texto de una opción al revisarla,
// indicando su estado: correcta, tu seleccion correcta, o tu respuesta incorrecta.
function addOptionBadge(btn, text, cssClass) {
    // Evitar duplicar el badge si checkAnswer se ejecuta mas de una vez.
    const existing = btn.querySelector('.option-badge');
    if (existing) existing.remove();

    const badge = document.createElement('span');
    badge.className = `option-badge ${cssClass}`;
    badge.innerText = text;
    btn.insertBefore(badge, btn.firstChild);
    btn.classList.add('has-badge');
}

function checkAnswer(isRestored = false) {
    const isMultipleChoice = Array.isArray(questions[currentIndex].correct);
    const hasSelection = isMultipleChoice ? selectedOption.length > 0 : selectedOption !== null;

    if (!hasSelection && !isRestored) {
        alert("Por favor selecciona una opción antes de continuar.");
        return;
    }

    const q = questions[currentIndex];
    if (isMultipleChoice && selectedOption.length !== q.correct.length && !isRestored) {
        alert(`Debes seleccionar exactamente ${q.correct.length} opciones.`);
        return;
    }

    const buttons = document.querySelectorAll('.option-btn');
    const selectedOptions = isMultipleChoice ? selectedOption : [selectedOption];

    userAnswers[currentIndex] = isMultipleChoice ? [...selectedOption] : selectedOption;
    saveProgress();

    buttons.forEach((btn, idx) => {
        btn.disabled = true;

        // En modo Jedi, mientras el examen NO ha terminado, no se revela acierto/error:
        // solo se marca la opción elegida. Al terminar (ver veredicto) sí se revela al revisar.
        if (examMode && !examFinished) {
            if (selectedOptions.includes(idx)) {
                btn.classList.add('selected');
            }
            return;
        }

        // Evalúa respuestas únicas o múltiples (arreglos)
        const isThisOptionCorrect = Array.isArray(q.correct) ? q.correct.includes(idx) : idx === q.correct;
        const wasSelected = selectedOptions.includes(idx);

        if (isThisOptionCorrect) {
            btn.classList.add('correct-ans');
            // Distingue si el usuario eligió esta correcta o no la marcó.
            addOptionBadge(btn, wasSelected ? 'Tu selección es correcta' : 'Respuesta correcta', 'badge-correct');
        } else if (wasSelected) {
            btn.classList.add('incorrect-ans');
            addOptionBadge(btn, 'Tu respuesta es incorrecta', 'badge-incorrect');
        } else {
            // Opción incorrecta que el usuario NO eligió: se marca tenue para
            // dejar claro que tampoco correspondía (útil en preguntas de 2 o 3).
            btn.classList.add('wrong-unselected');
        }
    });

    // Muestra la explicación en Padawan siempre, y en Jedi solo una vez terminado el examen.
    if (!examMode || examFinished) {
        document.getElementById('explanation-text').innerHTML = q.explanation;
        document.getElementById('explanation-box').style.display = 'block';
    }

    document.getElementById('submit-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'inline-block';

    // Refresca el resto de botones (Modificar respuesta, Ver puntaje) al confirmar,
    // sin esperar a que se re-renderice la pregunta.
    updateQuestionActionButtons();

    renderNavPanel();

    // Al confirmar, volver arriba para ver la pregunta y el resultado (útil en móvil).
    // Solo cuando el usuario confirma de verdad, no al restaurar el progreso guardado.
    if (!isRestored) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Permite modificar una respuesta ya confirmada (como en el examen real de AWS,
// donde puedes volver atrás y cambiar tu elección antes de finalizar).
// Borra la respuesta guardada de la pregunta actual y re-renderiza para elegir de nuevo.
function modifyAnswer() {
    if (userAnswers[currentIndex] === undefined) return;
    delete userAnswers[currentIndex];
    saveProgress();
    renderQuestion();
}

function nextQuestion() {
    currentIndex++;
    saveProgress();
    renderQuestion();
}

function previousQuestion() {
    if (currentIndex === 0) return;

    currentIndex--;
    saveProgress();
    renderQuestion();
}

function toggleFlag() {
    if (flaggedQuestions.includes(currentIndex)) {
        flaggedQuestions = flaggedQuestions.filter(idx => idx !== currentIndex);
    } else {
        flaggedQuestions.push(currentIndex);
    }
    saveProgress();
    updateFlaggedUI();
    updateQuestionActionButtons();
    renderNavPanel();
}

function updateQuestionActionButtons() {
    const hasConfirmedAnswer = userAnswers[currentIndex] !== undefined;
    const isFlagged = flaggedQuestions.includes(currentIndex);
    const canGoToNext = hasConfirmedAnswer || isFlagged;

    document.getElementById('submit-btn').style.display = canGoToNext ? 'none' : 'inline-block';
    document.getElementById('next-btn').style.display = canGoToNext ? 'inline-block' : 'none';

    // Botón "Modificar respuesta": SOLO en modo Jedi (examen), cuando la pregunta
    // ya fue confirmada y el examen aún no finalizó. En Padawan no tiene sentido,
    // porque al confirmar ya se revela si acertaste o no.
    const canModify = examMode && !examFinished && hasConfirmedAnswer;
    document.getElementById('modify-btn').style.display = canModify ? 'inline-block' : 'none';

    // Botón "Ver puntaje": aparece cuando TODAS las preguntas están respondidas,
    // para poder ir a la pantalla de resultados desde cualquier pregunta.
    const allAnswered = questions.length > 0 && Object.keys(userAnswers).length >= questions.length;
    document.getElementById('score-btn').style.display = allAnswered ? 'inline-block' : 'none';
}

function updateFlaggedUI() {
    const flagBtn = document.getElementById('flag-btn');
    const flaggedTags = document.getElementById('flagged-tags');

    if (flaggedQuestions.includes(currentIndex)) {
        flagBtn.innerText = "🚩 Marcada (Desmarcar)";
    } else {
        flagBtn.innerText = "🔖 Marcar para revisar";
    }

    if (flaggedQuestions.length === 0) {
        flaggedTags.innerHTML = "Ninguna";
    } else {
        flaggedTags.innerHTML = flaggedQuestions
            .sort((a, b) => a - b)
            .map(idx => `<button class="flag-tag" onclick="goToQuestion(${idx})">P${idx + 1}</button>`)
            .join(' ');
    }
}

function goToQuestion(index) {
    if (document.getElementById('results-body').style.display === 'block') {
        // Venimos de la pantalla de resultados: entrar en modo revisión
        // para que quede disponible el botón "Volver a resultados".
        reviewingFromResults = true;
        document.getElementById('results-body').style.display = 'none';
        document.getElementById('quiz-body').style.display = 'block';
    }
    currentIndex = index;
    saveProgress();
    renderQuestion();
}

function renderNavPanel() {
    const navGrid = document.getElementById('nav-grid');
    const navSummary = document.getElementById('nav-summary');
    if (!navGrid) return;

    if (questions.length === 0) {
        navGrid.innerHTML = '';
        navSummary.innerText = '0 de 0 respondidas';
        return;
    }

    const answeredCount = Object.keys(userAnswers).length;
    navSummary.innerText = `${answeredCount} de ${questions.length} respondidas`;

    navGrid.innerHTML = questions.map((question, index) => {
        const classes = ['nav-item'];
        const isAnswered = userAnswers[index] !== undefined;

        if (flaggedQuestions.includes(index)) {
            classes.push('flagged');
        } else if (isAnswered) {
            // En modo Jedi, mientras el examen no ha terminado, color neutro (sin revelar).
            // Al terminar (veredicto) sí se muestra correcto/incorrecto como en Padawan.
            if (examMode && !examFinished) {
                classes.push('answered-neutral');
            } else {
                classes.push(isAnswerCorrect(question, userAnswers[index]) ? 'correct' : 'incorrect');
            }
        }

        if (index === currentIndex) classes.push('current');
        return `<button class="${classes.join(' ')}" onclick="goToQuestion(${index})">P${index + 1}</button>`;
    }).join('');
}

function resetProgress() {
    const examName = getExamLabel(currentExamFile);
    if (confirm(`¿Reiniciar el examen "${examName}"?\n\nSe borrará solo tu avance y marcas de ESTE examen. Los demás exámenes no se tocan.`)) {
        localStorage.removeItem(storageKey('current_index'));
        localStorage.removeItem(storageKey('answers'));
        localStorage.removeItem(storageKey('flags'));
        currentIndex = 0;
        userAnswers = {};
        flaggedQuestions = [];
        reviewingFromResults = false;
        examFinished = false;
        saveProgress();
        document.getElementById('results-body').style.display = 'none';
        document.getElementById('quiz-body').style.display = 'block';
        document.getElementById('return-results-btn').style.display = 'none';
        renderQuestion();
    }
}

function isAnswerCorrect(question, answer) {
    if (Array.isArray(question.correct)) {
        return Array.isArray(answer)
            && question.correct.length === answer.length
            && question.correct.every(optionIndex => answer.includes(optionIndex));
    }

    return answer === question.correct;
}

function getIncorrectQuestions() {
    return questions
        .map((question, index) => ({ question, index }))
        .filter(({ question, index }) =>
            userAnswers[index] !== undefined && !isAnswerCorrect(question, userAnswers[index])
        );
}

function reviewIncorrectQuestion(index) {
    reviewingFromResults = true;
    document.getElementById('results-body').style.display = 'none';
    document.getElementById('quiz-body').style.display = 'block';
    document.getElementById('return-results-btn').style.display = 'inline-block';
    currentIndex = index;
    saveProgress();
    renderQuestion();
}

// Calcula estadísticas de aciertos/errores agrupadas por theme.
// Devuelve null si ninguna pregunta tiene theme (para no mostrar nada).
function getThemeStats() {
    const hasThemes = questions.some(q => q.theme && q.theme.trim() !== '');
    if (!hasThemes) return null;

    const stats = {};
    questions.forEach((question, index) => {
        const theme = (question.theme && question.theme.trim()) ? question.theme.trim() : 'Sin categoría';
        if (!stats[theme]) {
            stats[theme] = { total: 0, correct: 0, incorrect: 0, answered: 0 };
        }
        stats[theme].total++;
        if (userAnswers[index] !== undefined) {
            stats[theme].answered++;
            if (isAnswerCorrect(question, userAnswers[index])) {
                stats[theme].correct++;
            } else {
                stats[theme].incorrect++;
            }
        }
    });

    return stats;
}

function buildThemeSummaryHtml() {
    const stats = getThemeStats();
    if (!stats) return '';

    const rows = Object.keys(stats)
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
        .map(theme => {
            const s = stats[theme];
            const percent = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
            const safeTheme = theme.replace(/'/g, "\\'");
            return `
                <button class="theme-row" onclick="reviewByTheme('${safeTheme}')">
                    <div class="theme-row-head">
                        <span class="theme-name">${theme}</span>
                        <span class="theme-percent">${percent}%</span>
                    </div>
                    <div class="theme-bar"><div class="theme-bar-fill" style="width:${percent}%"></div></div>
                    <div class="theme-detail">✅ ${s.correct} correctas · ❌ ${s.incorrect} incorrectas · de ${s.total} preguntas</div>
                </button>
            `;
        }).join('');

    return `
        <h3>Resultado por categoría</h3>
        <p>Haz clic en una categoría para revisar sus preguntas.</p>
        <div class="theme-list">${rows}</div>
    `;
}

// Muestra las preguntas de un theme concreto, con su estado, para revisarlas.
function reviewByTheme(theme) {
    const items = questions
        .map((question, index) => ({ question, index }))
        .filter(({ question }) => {
            const t = (question.theme && question.theme.trim()) ? question.theme.trim() : 'Sin categoría';
            return t === theme;
        });

    const list = items.map(({ question, index }) => {
        const answered = userAnswers[index] !== undefined;
        const correct = answered && isAnswerCorrect(question, userAnswers[index]);
        const icon = !answered ? '⬜' : (correct ? '✅' : '❌');
        const cls = !answered ? 'theme-q-pending' : (correct ? 'theme-q-correct' : 'theme-q-incorrect');
        return `
            <button class="theme-q-btn ${cls}" onclick="reviewIncorrectQuestion(${index})">
                ${icon} Pregunta ${index + 1}: ${question.question}
            </button>
        `;
    }).join('');

    document.getElementById('quiz-body').style.display = 'none';
    document.getElementById('return-results-btn').style.display = 'none';
    const resultsBody = document.getElementById('results-body');
    resultsBody.style.display = 'block';
    resultsBody.innerHTML = `
        <h2>Categoría: ${theme}</h2>
        <div class="results-list">${list}</div>
        <button class="btn btn-secondary" onclick="showResults()">⬅️ Volver a resultados</button>
    `;
}

function returnToResults() {
    reviewingFromResults = false;
    document.getElementById('quiz-body').style.display = 'none';
    document.getElementById('return-results-btn').style.display = 'none';
    showResults();
}

function showResults(skipFlaggedPrompt = false) {
    reviewingFromResults = false;
    // Al llegar al veredicto, el examen (modo Jedi) queda "terminado": se revela el feedback.
    if (examMode) examFinished = true;
    document.getElementById('return-results-btn').style.display = 'none';
    let correctCount = 0;
    questions.forEach((q, idx) => {
        if (isAnswerCorrect(q, userAnswers[idx])) correctCount++;
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    if (!skipFlaggedPrompt && flaggedQuestions.length > 0) {
        const reviewFlagged = confirm(
            `Tienes ${flaggedQuestions.length} pregunta(s) marcada(s) para revisar. ¿Quieres revisarlas ahora?`
        );

        if (reviewFlagged) {
            goToQuestion([...flaggedQuestions].sort((a, b) => a - b)[0]);
            return;
        }
    }

    const incorrectQuestions = getIncorrectQuestions();
    const incorrectList = incorrectQuestions.length === 0
        ? '<p>✅ No tienes respuestas incorrectas.</p>'
        : `
            <h3>Preguntas para revisar</h3>
            <p>Haz clic en una pregunta para volver a verla con su explicación.</p>
            <div class="results-list">
                ${incorrectQuestions.map(({ question, index }) => `
                    <button class="wrong-question-btn" onclick="reviewIncorrectQuestion(${index})">
                        ❌ Pregunta ${index + 1}: ${question.question}
                    </button>
                `).join('')}
            </div>
        `;

    document.getElementById('quiz-body').style.display = 'none';
    document.getElementById('results-body').style.display = 'block';
    const themeSummary = buildThemeSummaryHtml();

    document.getElementById('results-body').innerHTML = `
        <h2>🎉 ¡Examen Completado!</h2>
        <p>Puntaje obtenido: <strong>${correctCount} / ${questions.length}</strong> (${scorePercent}%)</p>
        <p>${scorePercent >= 70 ? '✅ ¡Felicidades! Aprobaste la simulación.' : '⚠️ Te sugerimos repasar los conceptos e intentarlo de nuevo.'}</p>
        ${themeSummary}
        ${incorrectList}
        <button class="btn btn-primary" onclick="resetProgress()">Intentar de Nuevo 🔄</button>
    `;
}

// Permitir alternar el switch Padawan/Jedi con el teclado (Enter o Espacio).
document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement &&
        document.activeElement.id === 'mode-switch') {
        e.preventDefault();
        toggleExamMode();
    }
});

// Iniciar aplicación
initApp();
