let questions = [];
let currentIndex = 0;
let selectedOption = null;
let userAnswers = {};
let flaggedQuestions = [];
let currentExamFile = '';

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

async function discoverExamFiles() {
    const candidates = new Set();

    // 1. Intentar leer exams.json si existe
    try {
        const res = await fetch('exams.json', { cache: 'no-store' });
        if (res.ok) {
            const list = await res.json();
            if (Array.isArray(list)) list.forEach(f => candidates.add(f));
        }
    } catch (e) {}

    // 2. Si estamos en GitHub Pages, consultar API de GitHub para auto-descubrir TODO examen .json
    if (location.hostname.includes('github.io')) {
        try {
            const parts = location.pathname.split('/').filter(Boolean);
            const repo = parts[0];
            const user = location.hostname.split('.')[0];
            if (user && repo) {
                const apiRes = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/examenes`, { cache: 'no-store' });
                if (apiRes.ok) {
                    const contents = await apiRes.json();
                    if (Array.isArray(contents)) {
                        contents.forEach(item => {
                            if (item.name.endsWith('.json') && item.name !== 'exams.json' && item.size > 0) {
                                candidates.add(`examenes/${item.name}`);
                            }
                        });
                    }
                }
            }
        } catch (e) {}
    }

    // 3. Descubrimiento local de directorio (por ej. python -m http.server o Apache)
    try {
        const dirFiles = await discoverExamFilesFromDirectory();
        dirFiles.forEach(f => candidates.add(f));
    } catch (e) {}

    // 4. Patrones de respaldo conocidos por si la API o el índice estático fallan
    for (let i = 1; i <= 50; i++) candidates.add(`examenes/Examen${i}.json`);
    for (let i = 1; i <= 20; i++) candidates.add(`examenes/Examen_Modulo${i}.json`);
    for (let i = 1; i <= 20; i++) candidates.add(`examenes/Examen_practica_udemy${i}.json`);
    candidates.add('examenes/Examen_EC2_S3_VPC.json');
    candidates.add('examenes/Examen_EC2_S3_VPC_2.json');

    const fileList = [...candidates].filter(f => f.endsWith('.json') && !f.endsWith('exams.json'));

    // Validar que el archivo exista en el servidor, tenga contenido y sea JSON válido
    const checkPromises = fileList.map(async (file) => {
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
            .map(link => decodeURIComponent(link.getAttribute('href') || ''))
            .filter(file => /Examen[^/]*\.json$/i.test(file))
            .map(file => `examenes/${file.split('/').pop()}`);

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
            theme: q.theme || q.tema || ''
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
}

function saveProgress() {
    localStorage.setItem(storageKey('current_index'), currentIndex);
    localStorage.setItem(storageKey('answers'), JSON.stringify(userAnswers));
    localStorage.setItem(storageKey('flags'), JSON.stringify(flaggedQuestions));
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
    document.getElementById('previous-btn').style.display = currentIndex > 0 ? 'inline-block' : 'none';
    document.getElementById('submit-btn').style.display = 'inline-block';
    document.getElementById('next-btn').style.display = 'none';
    selectedOption = Array.isArray(q.correct) ? [] : null;

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
        
        // Evalúa respuestas únicas o múltiples (arreglos)
        const isThisOptionCorrect = Array.isArray(q.correct) ? q.correct.includes(idx) : idx === q.correct;

        if (isThisOptionCorrect) {
            btn.classList.add('correct-ans');
        } else if (selectedOptions.includes(idx)) {
            btn.classList.add('incorrect-ans');
        }
    });

    document.getElementById('explanation-text').innerHTML = q.explanation;
    document.getElementById('explanation-box').style.display = 'block';

    document.getElementById('submit-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'inline-block';

    renderNavPanel();
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
        document.getElementById('results-body').style.display = 'none';
        document.getElementById('quiz-body').style.display = 'block';
        document.getElementById('return-results-btn').style.display = 'none';
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
            classes.push(isAnswerCorrect(question, userAnswers[index]) ? 'correct' : 'incorrect');
        }

        if (index === currentIndex) classes.push('current');
        return `<button class="${classes.join(' ')}" onclick="goToQuestion(${index})">P${index + 1}</button>`;
    }).join('');
}

function resetProgress() {
    if (confirm("¿Estás seguro de reiniciar todo el examen? Se borrará tu avance y marcas.")) {
        localStorage.removeItem(storageKey('current_index'));
        localStorage.removeItem(storageKey('answers'));
        localStorage.removeItem(storageKey('flags'));
        currentIndex = 0;
        userAnswers = {};
        flaggedQuestions = [];
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
    document.getElementById('quiz-body').style.display = 'none';
    document.getElementById('return-results-btn').style.display = 'none';
    showResults();
}

function showResults() {
    document.getElementById('return-results-btn').style.display = 'none';
    let correctCount = 0;
    questions.forEach((q, idx) => {
        if (isAnswerCorrect(q, userAnswers[idx])) correctCount++;
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    if (flaggedQuestions.length > 0) {
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

// Iniciar aplicación
initApp();
