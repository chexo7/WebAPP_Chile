document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS GLOBALES ---
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const authStatus = document.getElementById('auth-status');
    const authContainer = document.getElementById('auth-container');
    const loginForm = document.getElementById('login-form');
    const logoutArea = document.getElementById('logout-area');

    const dataSelectionContainer = document.getElementById('data-selection-container');
    const backupSelector = document.getElementById('backup-selector');
    const loadBackupButton = document.getElementById('load-backup-button');
    const loadLatestVersionButton = document.getElementById('load-latest-version-button');
    const loadingMessage = document.getElementById('loading-message');

    const mainContentContainer = document.getElementById('main-content-container');
    const tabsContainer = document.querySelector('.tabs-container');
    const saveChangesButton = document.getElementById('save-changes-button');

    // --- ELEMENTOS PESTAÑA AJUSTES ---
    const settingsForm = document.getElementById('settings-form');
    const analysisPeriodicitySelect = document.getElementById('analysis-periodicity-select');
    const analysisDurationInput = document.getElementById('analysis-duration-input');
    const analysisDurationLabel = document.getElementById('analysis-duration-label');
    const analysisStartDateInput = document.getElementById('analysis-start-date-input');
    const analysisInitialBalanceInput = document.getElementById('analysis-initial-balance-input');
    const displayCurrencySymbolInput = document.getElementById('display-currency-symbol-input');
    const usdClpInfoLabel = document.getElementById('usd-clp-info-label'); // Etiqueta para mostrar la tasa
    const applySettingsButton = document.getElementById('apply-settings-button');

    // --- ELEMENTOS PESTAÑA INGRESOS ---
    const incomeForm = document.getElementById('income-form');
    const incomeNameInput = document.getElementById('income-name');
    const incomeAmountInput = document.getElementById('income-amount');
    const incomeFrequencySelect = document.getElementById('income-frequency');
    const incomeStartDateInput = document.getElementById('income-start-date');
    const incomeEndDateInput = document.getElementById('income-end-date');
    const incomeOngoingCheckbox = document.getElementById('income-ongoing');
    const incomeIsReimbursementCheckbox = document.getElementById('income-is-reimbursement');
    const incomeReimbursementCategoryContainer = document.getElementById('income-reimbursement-category-container');
    const incomeReimbursementCategorySelect = document.getElementById('income-reimbursement-category');
    const addIncomeButton = document.getElementById('add-income-button');
    const cancelEditIncomeButton = document.getElementById('cancel-edit-income-button');
    const incomesTableView = document.querySelector('#incomes-table-view tbody');
    const searchIncomeInput = document.getElementById('search-income-input');
    let editingIncomeIndex = null;

    // --- ELEMENTOS PESTAÑA GASTOS ---
    const expenseForm = document.getElementById('expense-form');
    const expenseNameInput = document.getElementById('expense-name');
    const expenseAmountInput = document.getElementById('expense-amount');
    const expenseCategorySelect = document.getElementById('expense-category');
    const addCategoryButton = document.getElementById('add-category-button');
    const removeCategoryButton = document.getElementById('remove-category-button');
    const expenseFrequencySelect = document.getElementById('expense-frequency');
    const expenseStartDateInput = document.getElementById('expense-start-date');
    const expenseEndDateInput = document.getElementById('expense-end-date');
    const expenseOngoingCheckbox = document.getElementById('expense-ongoing');
    const expenseIsRealCheckbox = document.getElementById('expense-is-real');
    const addExpenseButton = document.getElementById('add-expense-button');
    const cancelEditExpenseButton = document.getElementById('cancel-edit-expense-button');
    const expensesTableView = document.querySelector('#expenses-table-view tbody');
    const searchExpenseInput = document.getElementById('search-expense-input');
    let editingExpenseIndex = null;

    // --- ELEMENTOS PESTAÑA PRESUPUESTOS ---
    const budgetForm = document.getElementById('budget-form');
    const budgetCategorySelect = document.getElementById('budget-category-select');
    const budgetAmountInput = document.getElementById('budget-amount-input');
    const saveBudgetButton = document.getElementById('save-budget-button');
    const budgetsTableView = document.querySelector('#budgets-table-view tbody');
    const budgetSummaryTableBody = document.querySelector('#budget-summary-table tbody');

    // --- ELEMENTOS PESTAÑA REGISTRO PAGOS ---
    const paymentsTabTitle = document.getElementById('payments-tab-title');
    const prevPeriodButton = document.getElementById('prev-period-button');
    const nextPeriodButton = document.getElementById('next-period-button');
    const paymentYearSelect = document.getElementById('payment-year-select');
    const paymentMonthSelect = document.getElementById('payment-month-select');
    const paymentWeekSelect = document.getElementById('payment-week-select');
    const paymentsTableView = document.querySelector('#payments-table-view tbody');
    let currentPaymentViewDate = new Date();

    // --- ELEMENTOS PESTAÑA FLUJO DE CAJA ---
    const cashflowTableBody = document.querySelector('#cashflow-table tbody');
    const cashflowTableHead = document.querySelector('#cashflow-table thead');
    const cashflowTitle = document.getElementById('cashflow-title');

    // --- ELEMENTOS PESTAÑA GRÁFICO ---
    const cashflowChartCanvas = document.getElementById('cashflow-chart');
    const chartMessage = document.getElementById('chart-message');
    let cashflowChartInstance = null;

    // --- ELEMENTOS PESTAÑA BABY STEPS ---
    const babyStepsContainer = document.getElementById('baby-steps-container');

    // --- ELEMENTOS PESTAÑA RECORDATORIOS ---
    const reminderForm = document.getElementById('reminder-form');
    const reminderTextInput = document.getElementById('reminder-text-input');
    const addReminderButton = document.getElementById('add-reminder-button');
    const pendingRemindersList = document.getElementById('pending-reminders-list');
    const completedRemindersList = document.getElementById('completed-reminders-list');

    // --- ELEMENTOS PESTAÑA LOG ---
    const changeLogList = document.getElementById('change-log-list');


    // --- CONSTANTES Y ESTADO ---
    const MONTH_NAMES_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const MONTH_NAMES_FULL_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const DATE_WEEK_START_FORMAT = (date) => `${date.getUTCDate()}-${MONTH_NAMES_ES[date.getUTCMonth()]}`;
    let currentBackupData = null;
    let originalLoadedData = null;
    let currentBackupKey = null;
    let changeLogEntries = [];
    const FIREBASE_FORBIDDEN_KEY_CHARS = ['.', '$', '#', '[', ']', '/'];
    const FIREBASE_FORBIDDEN_CHARS_DISPLAY = FIREBASE_FORBIDDEN_KEY_CHARS.join(" ");

    const BABY_STEPS_DATA_JS = [
        {
            "title": "Paso 1: Ahorrar $1.000 (o equivalente) para tu fondo de emergencia inicial",
            "description": "El objetivo inmediato es crear un pequeño colchón financiero para imprevistos menores sin descarrilar tu plan. El monto exacto (ej: $1.000) puede variar según tu país y situación, adáptalo a un monto significativo pero alcanzable rápidamente.",
            "dos": [
                "Creas y sigues un presupuesto estricto para apartar dinero cada semana o mes hasta llegar al monto definido.",
                "Ajustas gastos discrecionales (comidas fuera, suscripciones) hasta completar este monto lo antes posible.",
                "Depositas este ahorro en una cuenta de alta liquidez, separada de tu cuenta corriente.",
            ],
            "donts": [
                "No pagas más del mínimo en tus deudas hasta completar este fondo.",
                "No inviertes en acciones, bonos ni aportes de jubilación.",
                "No usas tarjetas de crédito para cubrir emergencias mientras estás en este paso.",
            ]
        },
        {
            "title": "Paso 2: Pagar todas las deudas (excepto la hipoteca) con la “bola de nieve”",
            "description": "Liberarte de las deudas de consumo es crucial para redirigir tu dinero hacia la creación de riqueza. La 'bola de nieve' te da victorias rápidas y motivación.",
            "dos": [
                "Listas tus deudas de menor a mayor saldo, independientemente de la tasa de interés.",
                "Haces el pago mínimo en todas y destinas todo extra a la deuda más pequeña.",
                "Tras saldar una, trasladas su pago al siguiente saldo más pequeño, creando un “efecto bola de nieve”.",
            ],
            "donts": [
                "No inviertes en tu plan de retiro hasta completar este paso.",
                "No tomas préstamos nuevos ni compras a crédito.",
                "No tomas tu fondo de emergencia inicial para pagar deudas.",
            ]
        },
        {
            "title": "Paso 3: Ahorrar de 3 a 6 meses de gastos en tu fondo de emergencia completo",
            "description": "Este fondo te protege de eventos mayores (pérdida de empleo, emergencias médicas) sin tener que endeudarte o pausar tus inversiones futuras.",
            "dos": [
                "Calculas el promedio de tus gastos mensuales fijos (vivienda, comida, transporte).",
                "Continúas ahorrando hasta acumular el equivalente a 3–6 meses de esos gastos.",
                "Mantienes este dinero en un instrumento líquido (cuenta de ahorros, mercado monetario).",
            ],
            "donts": [
                "No usas este fondo para gastos cotidianos ni para pagar deudas.",
                "No inviertes estas reservas en activos de largo plazo debe estar disponible al instante.",
                "No reduces aportes futuros a tu retiro: esto comienza en el siguiente paso.",
            ]
        },
        {
            "title": "Paso 4: Invertir el 15 % de tu ingreso bruto en jubilación",
            "description": "Ahora que estás libre de deudas (excepto hipoteca) y tienes un fondo de emergencia sólido, es hora de construir tu futuro financiero a largo plazo.",
            "dos": [
                "Contribuyes con el 15 % de tu ingreso bruto mensual en cuentas con ventajas fiscales (ej: 401(k), IRA, Roth IRA, APV u otros según país).",
                "Primero aprovechas el “match” de tu empleador si existe (dinero gratis), luego completas el resto en otros planes/instrumentos.",
                "Diversificas en fondos de crecimiento según tu perfil de riesgo (ej: Growth & Income, Growth, Aggressive Growth, International).",
            ],
            "donts": [
                "No inviertes en productos sofisticados que no entiendas (criptomonedas volátiles, 'stock picking' especulativo).",
                "No dejas de aprovechar el “match” de tu empleador pensando que ya cumpliste el 15 %.",
                "No retrasas estos aportes si ya estás libre de deudas y con fondo de emergencia completo.",
            ]
        },
        {
            "title": "Paso 5: Ahorrar para la universidad de tus hijos",
            "description": "Con tu retiro encaminado, puedes empezar a planificar cómo ayudar a tus hijos con sus estudios superiores, si aplica a tu situación.",
            "dos": [
                "Eliges un plan de ahorro educativo (ej: 529, ESA en EEUU, u otros según tu país) o una cuenta de inversión dedicada.",
                "Estableces aportes regulares que no interfieran con tu 15 % de retiro.",
                "Aprovechas beneficios fiscales o ayudas estatales disponibles si existen.",
            ],
            "donts": [
                "No descuidas tu retiro para destinar más al ahorro educativo. Tu jubilación es prioritaria.",
                "No pides préstamos estudiantiles a tu nombre para tus hijos si compromete tu futuro financiero.",
            ]
        },
        {
            "title": "Paso 6: Pagar tu hipoteca anticipadamente",
            "description": "Ser dueño de tu casa sin deudas es un gran hito hacia la libertad financiera total. Cada pago extra acorta años de interés.",
            "dos": [
                "Destinas pagos extra mensuales, trimestrales o anuales directamente al principal de tu hipoteca.",
                "Consideras refinanciar si obtienes una tasa significativamente mejor sin altos costos de cierre, manteniendo un plazo igual o menor.",
                "Mantienes un nivel de vida controlado mientras aceleras los pagos.",
            ],
            "donts": [
                "No tomas nuevas deudas (líneas de crédito sobre la vivienda, refinanciamientos con retiro de efectivo) para otros fines.",
                "No retiras de tu fondo de emergencia o de la inversión para la jubilación para agilizar la hipoteca.",
                "No extiendes el plazo de tu hipoteca al refinanciar.",
            ]
        },
        {
            "title": "Paso 7: Construir riqueza y dar generosamente",
            "description": "¡Libertad financiera! Ahora puedes disfrutar los frutos de tu esfuerzo, seguir haciendo crecer tu patrimonio y tener un impacto positivo a través de la generosidad.",
            "dos": [
                "Sigues invirtiendo y haces crecer tu patrimonio neto con activos diversificados.",
                "Planificas donaciones y actividades filantrópicas según tus valores e intereses.",
                "Revisas periódicamente tu plan financiero y de inversiones con un asesor de confianza.",
                "Disfrutas de tu dinero responsablemente.",
            ],
            "donts": [
                "No dejas de revisar y ajustar tu portafolio según cambios en el mercado o tus metas de vida.",
                "No olvidas tu planificación sucesoria (testamento, fideicomisos) y tributaria al incrementar tu patrimonio.",
                "No tomas riesgos excesivos con tu patrimonio ya consolidado.",
            ]
        }
    ];

    const DEFAULT_EXPENSE_CATEGORIES_JS = {
        "Arriendo": "Fijo", "Gastos Comunes": "Fijo", "Cuentas": "Fijo", "Suscripciones": "Fijo", "Ahorros": "Fijo", "Créditos": "Fijo", "Inversiones": "Fijo",
        "Supermercado": "Variable", "Auto": "Variable", "Delivery": "Variable", "Salidas a comer": "Variable", "Minimarket": "Variable", "Uber": "Variable", "Regalos para alguien": "Variable", "Otros": "Variable", "Cosas de Casa": "Variable", "Salud": "Variable", "Panoramas": "Variable", "Ropa": "Variable", "Deporte": "Variable", "Vega": "Variable", "Transporte Publico": "Variable"
    };

    // --- VALIDACIÓN DE CLAVES DE FIREBASE ---
    function isFirebaseKeySafe(text) {
        if (typeof text !== 'string' || !text.trim()) {
            return false;
        }
        return !FIREBASE_FORBIDDEN_KEY_CHARS.some(char => text.includes(char));
    }

    // --- LÓGICA DE UI ---
    function showLoginScreen() {
        authContainer.style.display = 'block';
        loginForm.style.display = 'block';
        logoutArea.style.display = 'none';
        dataSelectionContainer.style.display = 'none';
        mainContentContainer.style.display = 'none';
        clearAllDataViews();
        currentBackupData = null;
        originalLoadedData = null;
        currentBackupKey = null;
        backupSelector.innerHTML = '<option value="">-- Selecciona una versión --</option>';
        loadLatestVersionButton.disabled = true;
    }

    function showDataSelectionScreen(user) {
        authContainer.style.display = 'block';
        loginForm.style.display = 'none';
        logoutArea.style.display = 'block';
        authStatus.textContent = `Conectado como: ${user.email}`; 
        dataSelectionContainer.style.display = 'block';
        mainContentContainer.style.display = 'none';
        fetchBackups();
    }

    function showMainContentScreen() {
        mainContentContainer.style.display = 'block';
        activateTab('gastos'); // Activate a default tab
        fetchAndUpdateUSDCLPRate(); // Fetch USD/CLP rate when main content is shown
    }

    function clearAllDataViews() {
        if (cashflowTableHead) cashflowTableHead.innerHTML = '';
        if (cashflowTableBody) cashflowTableBody.innerHTML = '';
        if (cashflowTitle) cashflowTitle.textContent = 'Flujo de Caja';
        if (incomesTableView) incomesTableView.innerHTML = '';
        if (expensesTableView) expensesTableView.innerHTML = '';
        if (budgetsTableView) budgetsTableView.innerHTML = '';
        if (budgetSummaryTableBody) budgetSummaryTableBody.innerHTML = '';
        if (paymentsTableView) paymentsTableView.innerHTML = '';
        if (babyStepsContainer) babyStepsContainer.innerHTML = '';
        if (pendingRemindersList) pendingRemindersList.innerHTML = '';
        if (completedRemindersList) completedRemindersList.innerHTML = '';
        if (changeLogList) changeLogList.innerHTML = '';

        if (expenseCategorySelect) expenseCategorySelect.innerHTML = '<option value="">Cargando...</option>';
        if (budgetCategorySelect) budgetCategorySelect.innerHTML = '<option value="">Cargando...</option>';
        if (incomeReimbursementCategorySelect) incomeReimbursementCategorySelect.innerHTML = '<option value="">Cargando...</option>';


        resetIncomeForm();
        resetExpenseForm();
        resetBudgetForm();
        resetReminderForm();
        if (cashflowChartInstance) {
            cashflowChartInstance.destroy();
            cashflowChartInstance = null;
        }
        if (chartMessage) chartMessage.textContent = "El gráfico se generará después de calcular el flujo de caja.";
        if (usdClpInfoLabel) usdClpInfoLabel.textContent = "1 USD = $CLP (Obteniendo...)";
    }

    // --- AUTENTICACIÓN ---
    loginButton.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        authStatus.textContent = "Ingresando...";
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                authStatus.textContent = `Error: ${error.message}`;
            });
    });
    logoutButton.addEventListener('click', () => { auth.signOut(); });
    auth.onAuthStateChanged(user => {     if (user) {         initializeUserDatabase(user.uid); // <-- Esta línea es clave para el cambio de BD         showDataSelectionScreen(user);     } else {         initializeUserDatabase(null); // Revertir a la BD por defecto al cerrar sesión         showLoginScreen();     } });

    // --- CARGA DE VERSIONES (BACKUPS) ---
    function fetchBackups() {
        loadingMessage.textContent = "Cargando lista de versiones...";
        loadingMessage.style.display = 'block';
        loadLatestVersionButton.disabled = true;
        database.ref('backups').once('value')
            .then(snapshot => {
                backupSelector.innerHTML = '<option value="">-- Selecciona una versión --</option>';
                if (snapshot.exists()) {
                    const backups = snapshot.val();
                    const sortedKeys = Object.keys(backups).sort().reverse();
                    sortedKeys.forEach(key => {
                        const option = document.createElement('option');
                        option.value = key;
                        option.textContent = formatBackupKey(key);
                        backupSelector.appendChild(option);
                    });
                    loadLatestVersionButton.disabled = sortedKeys.length === 0;
                } else {
                    backupSelector.innerHTML = '<option value="">No hay versiones disponibles</option>';
                    loadLatestVersionButton.disabled = true;
                }
                loadingMessage.style.display = 'none';
            })
            .catch(error => {
                console.error("Error fetching backups:", error);
                authStatus.textContent = `Error cargando versiones: ${error.message}`;
                loadingMessage.textContent = "Error al cargar versiones.";
                loadLatestVersionButton.disabled = true;
            });
    }

    loadLatestVersionButton.addEventListener('click', () => {
        if (backupSelector.options.length > 1) {
            const latestKey = backupSelector.options[1].value;
            if (latestKey) {
                backupSelector.value = latestKey;
                loadSpecificBackup(latestKey);
            } else {
                alert("No se encontró la última versión.");
            }
        } else {
            alert("No hay versiones disponibles para cargar.");
        }
    });

    loadBackupButton.addEventListener('click', () => {
        const selectedKey = backupSelector.value;
        if (selectedKey) {
            loadSpecificBackup(selectedKey);
        } else {
            alert("Por favor, selecciona una versión.");
        }
    });

    function loadSpecificBackup(key) {
        loadingMessage.textContent = `Cargando datos de la versión: ${formatBackupKey(key)}...`;
        loadingMessage.style.display = 'block';
        mainContentContainer.style.display = 'none';
        clearAllDataViews();
        originalLoadedData = null;

        database.ref(`backups/${key}`).once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    currentBackupData = snapshot.val();
                    currentBackupKey = key;

                    if (!currentBackupData.incomes) currentBackupData.incomes = [];
                    currentBackupData.incomes.forEach(inc => {
                        if (typeof inc.is_reimbursement === 'undefined') inc.is_reimbursement = false;
                        if (typeof inc.reimbursement_category === 'undefined') inc.reimbursement_category = null;
                    });

                    if (!currentBackupData.expenses) currentBackupData.expenses = [];
                    if (!currentBackupData.expense_categories || Object.keys(currentBackupData.expense_categories).length === 0) {
                        currentBackupData.expense_categories = JSON.parse(JSON.stringify(DEFAULT_EXPENSE_CATEGORIES_JS));
                    }
                    if (!currentBackupData.budgets) currentBackupData.budgets = {};
                    if (!currentBackupData.payments) currentBackupData.payments = {};
                    if (!currentBackupData.baby_steps_status || currentBackupData.baby_steps_status.length === 0) {
                        currentBackupData.baby_steps_status = BABY_STEPS_DATA_JS.map(step => ({
                            dos: new Array(step.dos.length).fill(false),
                            donts: new Array(step.donts.length).fill(false)
                        }));
                    }
                    if (!currentBackupData.reminders_todos) currentBackupData.reminders_todos = [];

                    changeLogEntries = currentBackupData.change_log || [];
                    if (!Array.isArray(changeLogEntries)) { 
                        changeLogEntries = [];
                    }
                    changeLogEntries.forEach(entry => {
                        if (!entry.user) {
                            entry.user = "Desconocido (Versión Antigua)";
                        }
                    });
                    currentBackupData.change_log = changeLogEntries;


                    currentBackupData.analysis_start_date = currentBackupData.analysis_start_date ? new Date(currentBackupData.analysis_start_date + 'T00:00:00Z') : new Date();
                    currentBackupData.analysis_duration = parseInt(currentBackupData.analysis_duration, 10) || 12;
                    currentBackupData.analysis_periodicity = currentBackupData.analysis_periodicity || "Mensual";
                    currentBackupData.analysis_initial_balance = parseFloat(currentBackupData.analysis_initial_balance) || 0;
                    currentBackupData.display_currency_symbol = currentBackupData.display_currency_symbol || "$";
                    // currentBackupData.usd_clp_rate = parseFloat(currentBackupData.usd_clp_rate) || null; // No longer stored

                    (currentBackupData.incomes || []).forEach(inc => {
                        if (inc.start_date) inc.start_date = new Date(inc.start_date + 'T00:00:00Z');
                        if (inc.end_date) inc.end_date = new Date(inc.end_date + 'T00:00:00Z');
                    });
                    (currentBackupData.expenses || []).forEach(exp => {
                        if (exp.start_date) exp.start_date = new Date(exp.start_date + 'T00:00:00Z');
                        if (exp.end_date) exp.end_date = new Date(exp.end_date + 'T00:00:00Z');
                    });

                    originalLoadedData = JSON.parse(JSON.stringify(currentBackupData));

                    populateSettingsForm();
                    populateExpenseCategoriesDropdowns();
                    populateIncomeReimbursementCategoriesDropdown();
                    renderIncomesTable();
                    renderExpensesTable();
                    renderBudgetsTable();
                    renderBabySteps();
                    renderReminders();
                    renderLogTab();
                    setupPaymentPeriodSelectors();
                    renderPaymentsTableForCurrentPeriod();
                    renderCashflowTable();

                    showMainContentScreen(); // This will also call fetchAndUpdateUSDCLPRate
                } else {
                    alert("La versión seleccionada no contiene datos válidos o está vacía.");
                    currentBackupData = null;
                    originalLoadedData = null;
                    currentBackupKey = null;
                    changeLogEntries = [];
                }
                loadingMessage.style.display = 'none';
            })
            .catch(error => {
                console.error("Error loading backup data:", error);
                alert(`Error al cargar datos de la versión: ${error.message}`);
                loadingMessage.textContent = "Error al cargar datos.";
                currentBackupData = null;
                originalLoadedData = null;
                currentBackupKey = null;
                changeLogEntries = [];
            });
    }

    function formatBackupKey(key) {
        if (!key) return "N/A";
        const ts = key.replace("backup_", "");
        if (ts.length === 15 && ts.includes('T')) {
            const year = ts.substring(0, 4);
            const month = ts.substring(4, 6);
            const day = ts.substring(6, 8);
            const hour = ts.substring(9, 11);
            const minute = ts.substring(11, 13);
            const second = ts.substring(13, 15);
            return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
        }
        return key;
    }

    function generateDetailedChangeLog(prevData, currentData) {
        const details = [];
        const symbol = currentData.display_currency_symbol || '$';

        if (!prevData) {
            details.push("Versión inicial de datos creada.");
            (currentData.incomes || []).forEach(inc => details.push(`Ingreso agregado: ${inc.name} (${formatCurrencyJS(inc.net_monthly, symbol)})${inc.is_reimbursement ? ' (Reembolso)' : ''}`));
            (currentData.expenses || []).forEach(exp => details.push(`Gasto agregado: ${exp.name} (${formatCurrencyJS(exp.amount, symbol)}, Cat: ${exp.category})`));
            return details;
        }

        if (prevData.analysis_periodicity !== currentData.analysis_periodicity) details.push(`Ajuste: Periodicidad cambiada de '${prevData.analysis_periodicity}' a '${currentData.analysis_periodicity}'.`);
        if (prevData.analysis_duration !== currentData.analysis_duration) details.push(`Ajuste: Duración cambiada de ${prevData.analysis_duration} a ${currentData.analysis_duration}.`);
        if (getISODateString(new Date(prevData.analysis_start_date)) !== getISODateString(new Date(currentData.analysis_start_date))) details.push(`Ajuste: Fecha de inicio cambiada de ${getISODateString(new Date(prevData.analysis_start_date))} a ${getISODateString(new Date(currentData.analysis_start_date))}.`);
        if (prevData.analysis_initial_balance !== currentData.analysis_initial_balance) details.push(`Ajuste: Saldo inicial cambiado de ${formatCurrencyJS(prevData.analysis_initial_balance, symbol)} a ${formatCurrencyJS(currentData.analysis_initial_balance, symbol)}.`);
        if (prevData.display_currency_symbol !== currentData.display_currency_symbol) details.push(`Ajuste: Símbolo de moneda cambiado de '${prevData.display_currency_symbol}' a '${currentData.display_currency_symbol}'.`);
        // No longer tracking usd_clp_rate in data model
        // if (prevData.usd_clp_rate !== currentData.usd_clp_rate) details.push(`Ajuste: Tasa USD/CLP cambiada de ${prevData.usd_clp_rate || 'N/A'} a ${currentData.usd_clp_rate || 'N/A'}.`);


        const prevIncomes = prevData.incomes || [];
        const currentIncomes = currentData.incomes || [];
        currentIncomes.forEach(currentInc => {
            const prevInc = prevIncomes.find(pInc => pInc.name === currentInc.name); // Simple find by name for now
            if (!prevInc) {
                details.push(`Ingreso agregado: ${currentInc.name} (${formatCurrencyJS(currentInc.net_monthly, symbol)}, ${currentInc.frequency}, Inicio: ${getISODateString(new Date(currentInc.start_date))}${currentInc.end_date ? ', Fin: ' + getISODateString(new Date(currentInc.end_date)) : ''})${currentInc.is_reimbursement ? ` (Reembolso de ${currentInc.reimbursement_category || 'N/A'})` : ''}.`);
            } else {
                let mods = [];
                if (prevInc.net_monthly !== currentInc.net_monthly) mods.push(`Monto: ${formatCurrencyJS(prevInc.net_monthly, symbol)} -> ${formatCurrencyJS(currentInc.net_monthly, symbol)}`);
                if (prevInc.frequency !== currentInc.frequency) mods.push(`Frecuencia: ${prevInc.frequency} -> ${currentInc.frequency}`);
                if (getISODateString(new Date(prevInc.start_date)) !== getISODateString(new Date(currentInc.start_date))) mods.push(`Fecha Inicio: ${getISODateString(new Date(prevInc.start_date))} -> ${getISODateString(new Date(currentInc.start_date))}`);
                const prevEndDateStr = prevInc.end_date ? getISODateString(new Date(prevInc.end_date)) : null;
                const currentEndDateStr = currentInc.end_date ? getISODateString(new Date(currentInc.end_date)) : null;
                if (prevEndDateStr !== currentEndDateStr) mods.push(`Fecha Fin: ${prevEndDateStr || 'N/A'} -> ${currentEndDateStr || 'N/A'}`);
                if ((prevInc.is_reimbursement || false) !== (currentInc.is_reimbursement || false)) {
                    mods.push(`Es Reembolso: ${prevInc.is_reimbursement ? 'Sí' : 'No'} -> ${currentInc.is_reimbursement ? 'Sí' : 'No'}`);
                }
                if (prevInc.reimbursement_category !== currentInc.reimbursement_category) {
                    mods.push(`Categoría Reembolso: ${prevInc.reimbursement_category || 'N/A'} -> ${currentInc.reimbursement_category || 'N/A'}`);
                }
                if (mods.length > 0) details.push(`Ingreso modificado '${currentInc.name}': ${mods.join(', ')}.`);
            }
        });
        prevIncomes.forEach(prevInc => {
            if (!currentIncomes.find(cInc => cInc.name === prevInc.name)) {
                details.push(`Ingreso eliminado: ${prevInc.name} (${formatCurrencyJS(prevInc.net_monthly, symbol)}).`);
            }
        });

        const prevExpenses = prevData.expenses || [];
        const currentExpenses = currentData.expenses || [];
        currentExpenses.forEach(currentExp => {
            const prevExp = prevExpenses.find(pExp => pExp.name === currentExp.name); // Simple find by name
            if (!prevExp) {
                details.push(`Gasto agregado: ${currentExp.name} (${formatCurrencyJS(currentExp.amount, symbol)}, Cat: ${currentExp.category}, ${currentExp.frequency}, Inicio: ${getISODateString(new Date(currentExp.start_date))}).`);
            } else {
                let mods = [];
                if (prevExp.amount !== currentExp.amount) mods.push(`Monto: ${formatCurrencyJS(prevExp.amount, symbol)} -> ${formatCurrencyJS(currentExp.amount, symbol)}`);
                if (prevExp.category !== currentExp.category) mods.push(`Categoría: ${prevExp.category} -> ${currentExp.category}`);
                if (prevExp.frequency !== currentExp.frequency) mods.push(`Frecuencia: ${prevExp.frequency} -> ${currentExp.frequency}`);
                if (getISODateString(new Date(prevExp.start_date)) !== getISODateString(new Date(currentExp.start_date))) mods.push(`Fecha Inicio: ${getISODateString(new Date(prevExp.start_date))} -> ${getISODateString(new Date(currentExp.start_date))}`);
                const prevEndDateStr = prevExp.end_date ? getISODateString(new Date(prevExp.end_date)) : null;
                const currentEndDateStr = currentExp.end_date ? getISODateString(new Date(currentExp.end_date)) : null;
                if (prevEndDateStr !== currentEndDateStr) mods.push(`Fecha Fin: ${prevEndDateStr || 'N/A'} -> ${currentEndDateStr || 'N/A'}`);
                if ((prevExp.is_real || false) !== (currentExp.is_real || false)) mods.push(`Es Real: ${prevExp.is_real ? 'Sí' : 'No'} -> ${currentExp.is_real ? 'Sí' : 'No'}`);
                if (mods.length > 0) details.push(`Gasto modificado '${currentExp.name}': ${mods.join(', ')}.`);
            }
        });
        prevExpenses.forEach(prevExp => {
            if (!currentExpenses.find(cExp => cExp.name === prevExp.name)) {
                details.push(`Gasto eliminado: ${prevExp.name} (${formatCurrencyJS(prevExp.amount, symbol)}).`);
            }
        });

        const prevCategories = prevData.expense_categories || {};
        const currentCategories = currentData.expense_categories || {};
        Object.keys(currentCategories).forEach(catName => {
            if (!prevCategories[catName]) {
                details.push(`Categoría agregada: ${catName} (Tipo: ${currentCategories[catName]}).`);
            } else if (prevCategories[catName] !== currentCategories[catName]) {
                details.push(`Categoría modificada '${catName}': Tipo ${prevCategories[catName]} -> ${currentCategories[catName]}.`);
            }
        });
        Object.keys(prevCategories).forEach(catName => {
            if (!currentCategories[catName]) {
                details.push(`Categoría eliminada: ${catName}.`);
            }
        });

        const prevBudgets = prevData.budgets || {};
        const currentBudgets = currentData.budgets || {};
        Object.keys(currentCategories).forEach(catName => {
            const prevAmount = prevBudgets[catName] !== undefined ? prevBudgets[catName] : 0;
            const currentAmount = currentBudgets[catName] !== undefined ? currentBudgets[catName] : 0;
            if (prevAmount !== currentAmount) {
                if (prevBudgets[catName] === undefined && currentAmount !== 0) {
                    details.push(`Presupuesto para '${catName}' establecido a: ${formatCurrencyJS(currentAmount, symbol)}.`);
                } else {
                    details.push(`Presupuesto para '${catName}' cambiado de ${formatCurrencyJS(prevAmount, symbol)} a ${formatCurrencyJS(currentAmount, symbol)}.`);
                }
            }
        });
        Object.keys(prevBudgets).forEach(catName => {
            if (!currentCategories[catName] && prevBudgets[catName] !== 0) {
                details.push(`Presupuesto para categoría eliminada '${catName}' (era ${formatCurrencyJS(prevBudgets[catName], symbol)}) removido.`);
            }
        });

        const prevReminders = prevData.reminders_todos || [];
        const currentReminders = currentData.reminders_todos || [];
        currentReminders.forEach((currentRem, idx) => {
            const prevRem = prevReminders.find(pRem => pRem.text === currentRem.text);
            if (!prevRem) {
                details.push(`Recordatorio agregado: "${currentRem.text}" (${currentRem.completed ? 'Completado' : 'Pendiente'}).`);
            } else {
                if (prevRem.completed !== currentRem.completed) {
                    details.push(`Recordatorio "${currentRem.text}" marcado como ${currentRem.completed ? 'Completado' : 'Pendiente'}.`);
                }
            }
        });
        prevReminders.forEach(prevRem => {
            if (!currentReminders.find(cRem => cRem.text === prevRem.text)) {
                details.push(`Recordatorio eliminado: "${prevRem.text}".`);
            }
        });

        if (JSON.stringify(prevData.baby_steps_status) !== JSON.stringify(currentData.baby_steps_status)) {
            details.push("Estado de Baby Steps modificado.");
        }

        if (JSON.stringify(prevData.payments) !== JSON.stringify(currentData.payments)) {
            details.push("Registros de pagos modificados.");
        }

        if (details.length === 0) {
            details.push("No se detectaron cambios significativos en los datos.");
        }
        return details;
    }

    // --- FUNCIÓN PARA MAPEAR EMAIL A NOMBRE ---
    function mapEmailToName(email) {
        if (!email) return 'Desconocido';
        if (email.toLowerCase() === "sergio.acevedo.santic@gmail.com") return "Sergio";
        if (email.toLowerCase() === "scarlett.real.e@gmail.com") return "Scarlett";
        const namePart = email.split('@')[0];
        const names = namePart.split('.');
        return names.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
    }


    // --- GUARDAR CAMBIOS (ÚNICO EVENT LISTENER) ---
    saveChangesButton.addEventListener('click', () => {
        if (!currentBackupData) {
            alert("No hay datos cargados para guardar.");
            return;
        }

        let dataIsValidForSaving = true;
        const validationIssues = [];

        (currentBackupData.incomes || []).forEach((inc, index) => {
            if (!isFirebaseKeySafe(inc.name)) {
                validationIssues.push(`Ingreso #${index + 1} ("${inc.name || 'Sin Nombre'}") tiene un nombre con caracteres no permitidos.`);
                dataIsValidForSaving = false;
            }
            if (inc.is_reimbursement && (!inc.reimbursement_category || !isFirebaseKeySafe(inc.reimbursement_category))) {
                validationIssues.push(`Ingreso de reembolso "${inc.name || 'Sin Nombre'}" no tiene una categoría de gasto válida seleccionada o la categoría tiene caracteres no permitidos.`);
                dataIsValidForSaving = false;
            }
        });
        (currentBackupData.expenses || []).forEach((exp, index) => {
            if (!isFirebaseKeySafe(exp.name)) {
                validationIssues.push(`Gasto #${index + 1} ("${exp.name || 'Sin Nombre'}") tiene un nombre con caracteres no permitidos.`);
                dataIsValidForSaving = false;
            }
            if (exp.category && !isFirebaseKeySafe(exp.category)) {
                validationIssues.push(`Gasto "${exp.name || 'Sin Nombre'}" usa una categoría con nombre no permitido: "${exp.category}".`);
                dataIsValidForSaving = false;
            }
        });
        if (currentBackupData.expense_categories) {
            for (const categoryName in currentBackupData.expense_categories) {
                if (!isFirebaseKeySafe(categoryName)) {
                    validationIssues.push(`La categoría de gasto "${categoryName}" tiene un nombre con caracteres no permitidos.`);
                    dataIsValidForSaving = false;
                }
            }
        }
        if (currentBackupData.budgets) {
            for (const categoryName in currentBackupData.budgets) {
                if (!isFirebaseKeySafe(categoryName)) {
                    validationIssues.push(`El presupuesto para la categoría "${categoryName}" tiene un nombre con caracteres no permitidos.`);
                    dataIsValidForSaving = false;
                }
            }
        }
        if (!dataIsValidForSaving) {
            alert("No se pueden guardar los cambios debido a los siguientes problemas:\n- " + validationIssues.join("\n- ") +
                `\n\nLos caracteres no permitidos son: ${FIREBASE_FORBIDDEN_CHARS_DISPLAY}. Por favor, corrige estos elementos.`);
            return;
        }

        const dataToSave = JSON.parse(JSON.stringify(currentBackupData));
        delete dataToSave.usd_clp_rate; // No guardar la tasa USD/CLP en Firebase

        const defaultsFromPython = {
            version: "1.0_web_v3_usd_clp_auto", // Updated version
            analysis_start_date: getISODateString(new Date()),
            analysis_duration: 12,
            analysis_periodicity: "Mensual",
            analysis_initial_balance: 0,
            display_currency_symbol: "$",
            // usd_clp_rate: null, // No longer stored
            incomes: [],
            expense_categories: JSON.parse(JSON.stringify(DEFAULT_EXPENSE_CATEGORIES_JS)),
            expenses: [],
            payments: {},
            budgets: {},
            baby_steps_status: BABY_STEPS_DATA_JS.map(step => ({
                dos: new Array(step.dos.length).fill(false),
                donts: new Array(step.donts.length).fill(false)
            })),
            reminders_todos: [],
            change_log: []
        };
        for (const key in defaultsFromPython) {
            if (dataToSave[key] === undefined || dataToSave[key] === null) {
                if (key === 'expense_categories' && currentBackupData.expense_categories && Object.keys(currentBackupData.expense_categories).length > 0) {
                    // No sobreescribir si ya existen
                } else if (key === 'budgets' && currentBackupData.budgets && Object.keys(currentBackupData.budgets).length > 0) {
                    // No sobreescribir si ya existen
                } else if (key === 'baby_steps_status' && currentBackupData.baby_steps_status && currentBackupData.baby_steps_status.length > 0) {
                    // No sobreescribir si ya existen
                }
                else {
                    dataToSave[key] = defaultsFromPython[key];
                }
            }
        }

        dataToSave.analysis_start_date = getISODateString(new Date(dataToSave.analysis_start_date));
        (dataToSave.incomes || []).forEach(inc => {
            if (inc.start_date) inc.start_date = getISODateString(new Date(inc.start_date));
            if (inc.end_date) inc.end_date = getISODateString(new Date(inc.end_date));
            inc.is_reimbursement = typeof inc.is_reimbursement === 'boolean' ? inc.is_reimbursement : false;
            inc.reimbursement_category = inc.is_reimbursement ? (inc.reimbursement_category || null) : null;
        });
        (dataToSave.expenses || []).forEach(exp => {
            if (exp.start_date) exp.start_date = getISODateString(new Date(exp.start_date));
            if (exp.end_date) exp.end_date = getISODateString(new Date(exp.end_date));
            if (exp.category && dataToSave.expense_categories && dataToSave.expense_categories[exp.category]) {
                exp.type = dataToSave.expense_categories[exp.category];
            } else {
                exp.type = "Variable";
            }
            if (typeof exp.is_real === 'undefined') {
                exp.is_real = false;
            }
        });
        const formattedPayments = {};
        if (dataToSave.payments) {
            for (const keyObj in dataToSave.payments) {
                formattedPayments[keyObj] = dataToSave.payments[keyObj];
            }
        }
        dataToSave.payments = formattedPayments;

        const detailedChanges = generateDetailedChangeLog(originalLoadedData, currentBackupData);

        const now = new Date();
        const newBackupKey = `backup_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}T${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

        let logMessage = `Nueva versión ${formatBackupKey(newBackupKey)} guardada.`;
        if (currentBackupKey) {
            logMessage += ` Basada en ${formatBackupKey(currentBackupKey)}.`;
        } else {
            logMessage += ` Creada desde un estado inicial o datos por defecto.`;
        }

        const user = firebase.auth().currentUser;
        const userName = user && user.email ? mapEmailToName(user.email) : 'Desconocido';


        const logEntry = {
            timestamp: now.toISOString(),
            message: logMessage,
            details: detailedChanges,
            newVersionKey: newBackupKey,
            previousVersionKey: currentBackupKey || null,
            user: userName
        };

        if (!Array.isArray(changeLogEntries)) {
            changeLogEntries = [];
        }
        changeLogEntries.unshift(logEntry);
        dataToSave.change_log = changeLogEntries;

        loadingMessage.textContent = "Guardando cambios como nueva versión...";
        loadingMessage.style.display = 'block';

        database.ref('backups/' + newBackupKey).set(dataToSave)
            .then(() => {
                loadingMessage.style.display = 'none';
                alert(`Cambios guardados exitosamente como nueva versión: ${formatBackupKey(newBackupKey)}`);

                currentBackupKey = newBackupKey;
                currentBackupData = JSON.parse(JSON.stringify(dataToSave));

                currentBackupData.analysis_start_date = new Date(currentBackupData.analysis_start_date + 'T00:00:00Z');
                (currentBackupData.incomes || []).forEach(inc => {
                    if (inc.start_date) inc.start_date = new Date(inc.start_date + 'T00:00:00Z');
                    if (inc.end_date) inc.end_date = new Date(inc.end_date + 'T00:00:00Z');
                });
                (currentBackupData.expenses || []).forEach(exp => {
                    if (exp.start_date) exp.start_date = new Date(exp.start_date + 'T00:00:00Z');
                    if (exp.end_date) exp.end_date = new Date(exp.end_date + 'T00:00:00Z');
                });
                originalLoadedData = JSON.parse(JSON.stringify(currentBackupData));

                fetchBackups();
                backupSelector.value = newBackupKey;

                renderLogTab();
            })
            .catch(error => {
                loadingMessage.style.display = 'none';
                console.error("Error saving new version:", error);
                alert(`Error al guardar la nueva versión: ${error.message}`);
                changeLogEntries.shift();
            });
    });


    // --- NAVEGACIÓN POR PESTAÑAS ---
    function activateTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));

        const activeContent = document.getElementById(tabId);
        const activeButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);

        if (activeContent) activeContent.classList.add('active');
        if (activeButton) activeButton.classList.add('active');

        if (tabId === 'flujo-caja' || tabId === 'grafico') renderCashflowTable();
        if (tabId === 'presupuestos') { renderBudgetsTable(); renderBudgetSummaryTable(); }
        if (tabId === 'registro-pagos') { setupPaymentPeriodSelectors(); renderPaymentsTableForCurrentPeriod(); }
        if (tabId === 'ajustes') {
            populateSettingsForm();
            fetchAndUpdateUSDCLPRate(); // Fetch rate when adjustments tab is activated
        }
        if (tabId === 'log') renderLogTab();
    }
    tabsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('tab-button')) activateTab(event.target.dataset.tab);
    });

    // --- LÓGICA PESTAÑA AJUSTES ---
    async function fetchAndUpdateUSDCLPRate() {
        if (!usdClpInfoLabel) return;
        usdClpInfoLabel.innerHTML = `1 USD = $CLP (Obteniendo...) <span class="loading-dots"></span>`;
        const API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=clp";
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Error de red: ${response.status}`);
            }
            const data = await response.json();
            const clpRate = data.usd && data.usd.clp;
            if (clpRate === undefined || clpRate === null) {
                throw new Error("Tasa CLP no encontrada en la respuesta de la API.");
            }
            usdClpInfoLabel.textContent = `1 USD = ${clpRate.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Fuente: CoinGecko)`;
        } catch (error) {
            console.warn("No se pudo actualizar el USD/CLP:", error);
            usdClpInfoLabel.innerHTML = `<b>1 USD = N/D</b> <small>(Error al obtener tasa)</small>`;
        }
    }


    function populateSettingsForm() {
        if (!currentBackupData) return;
        analysisPeriodicitySelect.value = currentBackupData.analysis_periodicity || "Mensual";
        analysisDurationInput.value = currentBackupData.analysis_duration || 12;
        analysisStartDateInput.value = getISODateString(currentBackupData.analysis_start_date ? new Date(currentBackupData.analysis_start_date) : new Date());
        analysisInitialBalanceInput.value = currentBackupData.analysis_initial_balance || 0;
        displayCurrencySymbolInput.value = currentBackupData.display_currency_symbol || "$";
        // usdClpRateInput.value = currentBackupData.usd_clp_rate || ''; // No longer used
        // updateUsdClpInfoLabel(); // This will be handled by fetchAndUpdateUSDCLPRate
        updateAnalysisDurationLabel();
    }
    analysisPeriodicitySelect.addEventListener('change', updateAnalysisDurationLabel);
    function updateAnalysisDurationLabel() {
        analysisDurationLabel.textContent = analysisPeriodicitySelect.value === "Semanal" ? "Duración (Semanas):" : "Duración (Meses):";
    }
    // usdClpRateInput.addEventListener('input', updateUsdClpInfoLabel); // No longer used
    // function updateUsdClpInfoLabel() { // No longer used, handled by fetchAndUpdateUSDCLPRate
    //     const rate = parseFloat(usdClpRateInput.value);
    //     usdClpInfoLabel.textContent = (rate && rate > 0) ? `1 USD = ${rate.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "1 USD = $CLP (No se usa en cálculos aún)";
    // }
    applySettingsButton.addEventListener('click', () => {
        if (!currentBackupData) { alert("No hay datos cargados para aplicar ajustes."); return; }
        const prevPeriodicity = currentBackupData.analysis_periodicity;
        const newPeriodicity = analysisPeriodicitySelect.value;

        currentBackupData.analysis_periodicity = newPeriodicity;
        currentBackupData.analysis_duration = parseInt(analysisDurationInput.value, 10);
        currentBackupData.analysis_start_date = new Date(analysisStartDateInput.value + 'T00:00:00Z');
        currentBackupData.analysis_initial_balance = parseFloat(analysisInitialBalanceInput.value);
        currentBackupData.display_currency_symbol = displayCurrencySymbolInput.value.trim() || "$";
        // currentBackupData.usd_clp_rate = parseFloat(usdClpRateInput.value) || null; // No longer stored

        if (prevPeriodicity !== newPeriodicity) {
            const prevDefaultDuration = (prevPeriodicity === "Mensual") ? 12 : 52;
            if (currentBackupData.analysis_duration === prevDefaultDuration) {
                currentBackupData.analysis_duration = (newPeriodicity === "Mensual") ? 12 : 52;
                analysisDurationInput.value = currentBackupData.analysis_duration;
            }
        }
        updateAnalysisDurationLabel();
        alert("Ajustes aplicados. El flujo de caja y el gráfico se recalcularán.");
        renderCashflowTable();
        setupPaymentPeriodSelectors();
        renderPaymentsTableForCurrentPeriod();
        renderBudgetsTable();
        renderBudgetSummaryTable();
    });

    // --- LÓGICA PESTAÑA INGRESOS ---
    incomeOngoingCheckbox.addEventListener('change', () => {
        incomeEndDateInput.disabled = incomeOngoingCheckbox.checked;
        if (incomeOngoingCheckbox.checked) incomeEndDateInput.value = '';
    });
    incomeFrequencySelect.addEventListener('change', () => {
        const isUnico = incomeFrequencySelect.value === 'Único';
        incomeOngoingCheckbox.disabled = isUnico;
        incomeEndDateInput.disabled = isUnico || incomeOngoingCheckbox.checked;
        if (isUnico) { incomeOngoingCheckbox.checked = false; incomeEndDateInput.value = ''; }
    });

    incomeIsReimbursementCheckbox.addEventListener('change', () => {
        incomeReimbursementCategoryContainer.style.display = incomeIsReimbursementCheckbox.checked ? 'block' : 'none';
        if (incomeIsReimbursementCheckbox.checked) {
            populateIncomeReimbursementCategoriesDropdown();
        } else {
            incomeReimbursementCategorySelect.value = '';
        }
    });

    function populateIncomeReimbursementCategoriesDropdown() {
        if (!incomeReimbursementCategorySelect || !currentBackupData || !currentBackupData.expense_categories) {
            if (incomeReimbursementCategorySelect) incomeReimbursementCategorySelect.innerHTML = '<option value="">No hay categorías de gasto</option>';
            return;
        }
        const currentValue = incomeReimbursementCategorySelect.value;
        incomeReimbursementCategorySelect.innerHTML = '<option value="">-- Selecciona Categoría de Gasto --</option>';
        const sortedCategories = Object.keys(currentBackupData.expense_categories).sort();
        sortedCategories.forEach(catName => {
            if (isFirebaseKeySafe(catName)) {
                const option = document.createElement('option');
                option.value = catName;
                option.textContent = catName;
                incomeReimbursementCategorySelect.appendChild(option);
            }
        });
        if (sortedCategories.includes(currentValue)) {
            incomeReimbursementCategorySelect.value = currentValue;
        }
    }


    incomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = incomeNameInput.value.trim();
        const amount = parseFloat(incomeAmountInput.value);
        const frequency = incomeFrequencySelect.value;
        const startDateValue = incomeStartDateInput.value;
        const endDateValue = incomeEndDateInput.value;
        const isReimbursement = incomeIsReimbursementCheckbox.checked;
        const reimbursementCategory = isReimbursement ? incomeReimbursementCategorySelect.value : null;

        if (!isFirebaseKeySafe(name)) { alert(`El nombre del ingreso "${name}" contiene caracteres no permitidos: ${FIREBASE_FORBIDDEN_CHARS_DISPLAY}.`); return; }
        if (!name) { alert("El nombre del ingreso no puede estar vacío."); return; }
        if (isReimbursement && !reimbursementCategory) { alert("Si es un reembolso, debe seleccionar una categoría de gasto a reembolsar."); return; }


        const startDate = startDateValue ? new Date(startDateValue + 'T00:00:00Z') : null;
        const isOngoing = incomeOngoingCheckbox.checked;
        const endDate = (frequency === 'Único' || isOngoing || !endDateValue) ? null : new Date(endDateValue + 'T00:00:00Z');

        if (isNaN(amount) || !startDate) { alert("Por favor, completa los campos obligatorios (Nombre, Monto, Fecha Inicio)."); return; }
        if (endDate && startDate && endDate < startDate) { alert("La fecha de fin no puede ser anterior a la fecha de inicio."); return; }

        const incomeEntry = {
            name,
            net_monthly: amount,
            frequency,
            start_date: startDate,
            end_date: endDate,
            is_reimbursement: isReimbursement,
            reimbursement_category: reimbursementCategory
        };

        if (editingIncomeIndex !== null) {
            currentBackupData.incomes[editingIncomeIndex] = incomeEntry;
        } else {
            if (!currentBackupData.incomes) currentBackupData.incomes = [];
            currentBackupData.incomes.push(incomeEntry);
        }
        renderIncomesTable(); renderCashflowTable(); resetIncomeForm();
    });

    function resetIncomeForm() {
        incomeForm.reset();
        incomeOngoingCheckbox.checked = true;
        incomeEndDateInput.disabled = true; incomeEndDateInput.value = '';
        incomeFrequencySelect.value = 'Mensual';

        incomeIsReimbursementCheckbox.checked = false;
        incomeReimbursementCategoryContainer.style.display = 'none';
        incomeReimbursementCategorySelect.value = '';

        addIncomeButton.textContent = 'Agregar Ingreso';
        cancelEditIncomeButton.style.display = 'none';
        editingIncomeIndex = null;
        incomeStartDateInput.value = getISODateString(currentBackupData && currentBackupData.analysis_start_date ? new Date(currentBackupData.analysis_start_date) : new Date());
    }
    cancelEditIncomeButton.addEventListener('click', resetIncomeForm);

    function renderIncomesTable() {
        if (!incomesTableView || !currentBackupData || !currentBackupData.incomes) return;
        incomesTableView.innerHTML = '';
        const searchTerm = searchIncomeInput.value.toLowerCase();
        const filteredIncomes = currentBackupData.incomes.filter(income =>
            income.name.toLowerCase().includes(searchTerm) ||
            formatCurrencyJS(income.net_monthly, currentBackupData.display_currency_symbol || '$').toLowerCase().includes(searchTerm) ||
            income.frequency.toLowerCase().includes(searchTerm) ||
            (income.is_reimbursement && "reembolso".includes(searchTerm))
        );
        filteredIncomes.forEach((income) => {
            const originalIndex = currentBackupData.incomes.findIndex(inc => inc === income);
            const row = incomesTableView.insertRow();
            row.insertCell().textContent = income.name;
            row.insertCell().textContent = formatCurrencyJS(income.net_monthly, currentBackupData.display_currency_symbol || '$');
            row.insertCell().textContent = income.frequency;
            row.insertCell().textContent = income.start_date ? getISODateString(new Date(income.start_date)) : 'N/A';
            row.insertCell().textContent = income.end_date ? getISODateString(new Date(income.end_date)) : (income.frequency === 'Único' ? 'N/A (Único)' : 'Recurrente');

            const typeCell = row.insertCell();
            if (income.is_reimbursement) {
                typeCell.innerHTML = `Reembolso <span class="reimbursement-icon" title="Reembolso de ${income.reimbursement_category || 'N/A'}">↺</span>`;
                typeCell.classList.add('reimbursement-income');
            } else {
                typeCell.textContent = 'Ingreso Regular';
            }

            const actionsCell = row.insertCell();
            const editButton = document.createElement('button'); editButton.textContent = 'Editar'; editButton.classList.add('small-button');
            editButton.onclick = () => loadIncomeForEdit(originalIndex); actionsCell.appendChild(editButton);
            const deleteButton = document.createElement('button'); deleteButton.textContent = 'Eliminar'; deleteButton.classList.add('small-button', 'danger');
            deleteButton.onclick = () => deleteIncome(originalIndex); actionsCell.appendChild(deleteButton);
        });
    }
    searchIncomeInput.addEventListener('input', renderIncomesTable);

    function loadIncomeForEdit(index) {
        const income = currentBackupData.incomes[index];
        incomeNameInput.value = income.name;
        incomeAmountInput.value = income.net_monthly;
        incomeFrequencySelect.value = income.frequency;
        incomeStartDateInput.value = income.start_date ? getISODateString(new Date(income.start_date)) : '';

        const isUnico = income.frequency === 'Único';
        incomeOngoingCheckbox.disabled = isUnico;
        if (isUnico) {
            incomeOngoingCheckbox.checked = false; incomeEndDateInput.value = ''; incomeEndDateInput.disabled = true;
        } else {
            incomeOngoingCheckbox.checked = !income.end_date;
            incomeEndDateInput.value = income.end_date ? getISODateString(new Date(income.end_date)) : '';
            incomeEndDateInput.disabled = incomeOngoingCheckbox.checked;
        }

        incomeIsReimbursementCheckbox.checked = income.is_reimbursement || false;
        if (incomeIsReimbursementCheckbox.checked) {
            populateIncomeReimbursementCategoriesDropdown();
            incomeReimbursementCategorySelect.value = income.reimbursement_category || '';
            incomeReimbursementCategoryContainer.style.display = 'block';
        } else {
            incomeReimbursementCategorySelect.value = '';
            incomeReimbursementCategoryContainer.style.display = 'none';
        }

        addIncomeButton.textContent = 'Guardar Cambios'; cancelEditIncomeButton.style.display = 'inline-block';
        editingIncomeIndex = index; document.getElementById('ingresos').scrollIntoView({ behavior: 'smooth' });
    }

    function deleteIncome(index) {
        if (confirm(`¿Eliminar ingreso "${currentBackupData.incomes[index].name}"?`)) {
            currentBackupData.incomes.splice(index, 1);
            renderIncomesTable(); renderCashflowTable();
            if (editingIncomeIndex === index) resetIncomeForm();
            else if (editingIncomeIndex !== null && editingIncomeIndex > index) editingIncomeIndex--;
        }
    }

    // --- LÓGICA PESTAÑA GASTOS ---
    expenseOngoingCheckbox.addEventListener('change', () => {
        expenseEndDateInput.disabled = expenseOngoingCheckbox.checked;
        if (expenseOngoingCheckbox.checked) expenseEndDateInput.value = '';
    });
    expenseFrequencySelect.addEventListener('change', () => {
        const isUnico = expenseFrequencySelect.value === 'Único';
        expenseOngoingCheckbox.disabled = isUnico;
        expenseEndDateInput.disabled = isUnico || expenseOngoingCheckbox.checked;
        if (isUnico) { expenseOngoingCheckbox.checked = false; expenseEndDateInput.value = ''; }
    });
    function populateExpenseCategoriesDropdowns() {
        const selects = [expenseCategorySelect, budgetCategorySelect];
        selects.forEach(select => {
            if (!select || !currentBackupData || !currentBackupData.expense_categories) {
                if (select) select.innerHTML = '<option value="">No hay categorías</option>'; return;
            }
            const currentValue = select.value;
            select.innerHTML = '<option value="">-- Selecciona Categoría --</option>';
            const sortedCategories = Object.keys(currentBackupData.expense_categories).sort();
            sortedCategories.forEach(catName => {
                if (isFirebaseKeySafe(catName)) {
                    const option = document.createElement('option'); option.value = catName; option.textContent = catName;
                    select.appendChild(option);
                }
            });
            if (sortedCategories.includes(currentValue)) select.value = currentValue;
            else if (sortedCategories.length > 0 && select.id === 'expense-category') select.value = sortedCategories[0];
        });
        updateRemoveCategoryButtonState();
        populateIncomeReimbursementCategoriesDropdown();
    }
    addCategoryButton.addEventListener('click', () => {
        const newCategoryName = prompt("Nombre de la nueva categoría de gasto:");
        if (newCategoryName && newCategoryName.trim()) {
            const trimmedName = newCategoryName.trim();
            if (!isFirebaseKeySafe(trimmedName)) { alert(`El nombre de categoría "${trimmedName}" contiene caracteres no permitidos: ${FIREBASE_FORBIDDEN_CHARS_DISPLAY}.`); return; }
            if (currentBackupData.expense_categories[trimmedName]) { alert(`La categoría "${trimmedName}" ya existe.`); return; }
            const categoryType = prompt(`Tipo para "${trimmedName}" (Fijo/Variable):`, "Variable");
            if (categoryType && (categoryType.toLowerCase() === 'fijo' || categoryType.toLowerCase() === 'variable')) {
                currentBackupData.expense_categories[trimmedName] = categoryType.charAt(0).toUpperCase() + categoryType.slice(1).toLowerCase();
                if (!currentBackupData.budgets) currentBackupData.budgets = {};
                currentBackupData.budgets[trimmedName] = 0;
                populateExpenseCategoriesDropdowns(); renderBudgetsTable();
                alert(`Categoría "${trimmedName}" (${currentBackupData.expense_categories[trimmedName]}) agregada.`);
            } else if (categoryType !== null) alert("Tipo de categoría inválido. Debe ser 'Fijo' o 'Variable'.");
        }
    });
    removeCategoryButton.addEventListener('click', () => {
        const categoryToRemove = expenseCategorySelect.value;
        if (!categoryToRemove) { alert("Selecciona una categoría para eliminar."); return; }
        if (currentBackupData.expenses.some(exp => exp.category === categoryToRemove)) { alert(`Categoría "${categoryToRemove}" en uso por un gasto, no se puede eliminar.`); return; }
        if (currentBackupData.incomes.some(inc => inc.is_reimbursement && inc.reimbursement_category === categoryToRemove)) { alert(`Categoría "${categoryToRemove}" en uso por un reembolso, no se puede eliminar.`); return; }
        if (confirm(`¿Eliminar categoría "${categoryToRemove}" y su presupuesto asociado?`)) {
            delete currentBackupData.expense_categories[categoryToRemove];
            if (currentBackupData.budgets) delete currentBackupData.budgets[categoryToRemove];
            populateExpenseCategoriesDropdowns(); renderBudgetsTable();
            alert(`Categoría "${categoryToRemove}" eliminada.`);
        }
    });
    expenseCategorySelect.addEventListener('change', updateRemoveCategoryButtonState);
    function updateRemoveCategoryButtonState() {
        const selectedCategory = expenseCategorySelect.value;
        if (selectedCategory && currentBackupData && currentBackupData.expense_categories && currentBackupData.expense_categories[selectedCategory]) {
            const isInUseByExpense = (currentBackupData.expenses || []).some(exp => exp.category === selectedCategory);
            const isInUseByReimbursement = (currentBackupData.incomes || []).some(inc => inc.is_reimbursement && inc.reimbursement_category === selectedCategory);
            const isInUse = isInUseByExpense || isInUseByReimbursement;

            removeCategoryButton.disabled = isInUse;
            removeCategoryButton.title = isInUse ? `Categoría en uso (por gasto o reembolso)` : `Eliminar categoría '${selectedCategory}'`;
        } else {
            removeCategoryButton.disabled = true;
            removeCategoryButton.title = `Selecciona una categoría válida`;
        }
    }
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = expenseNameInput.value.trim();
        const amount = parseFloat(expenseAmountInput.value);
        const category = expenseCategorySelect.value;
        const frequency = expenseFrequencySelect.value;
        const startDateValue = expenseStartDateInput.value;
        const endDateValue = expenseEndDateInput.value;

        if (!isFirebaseKeySafe(name)) { alert(`El nombre del gasto "${name}" contiene caracteres no permitidos.`); return; }
        if (!name) { alert("El nombre del gasto no puede estar vacío."); return; }
        if (!category) { alert("Selecciona una categoría."); return; }
        if (!isFirebaseKeySafe(category)) { alert(`Categoría "${category}" con nombre no permitido.`); return; }

        const startDate = startDateValue ? new Date(startDateValue + 'T00:00:00Z') : null;
        const isOngoing = expenseOngoingCheckbox.checked;
        const endDate = (frequency === 'Único' || isOngoing || !endDateValue) ? null : new Date(endDateValue + 'T00:00:00Z');
        const isReal = expenseIsRealCheckbox.checked;

        if (isNaN(amount) || !category || !startDate) { alert("Completa los campos obligatorios (Nombre, Monto, Categoría, Fecha Inicio)."); return; }
        if (endDate && startDate && endDate < startDate) { alert("Fecha de fin no puede ser anterior a fecha de inicio."); return; }

        const expenseType = currentBackupData.expense_categories[category] || "Variable";
        const expenseEntry = { name, amount, category, type: expenseType, frequency, start_date: startDate, end_date: endDate, is_real: isReal };

        if (editingExpenseIndex !== null) {
            currentBackupData.expenses[editingExpenseIndex] = expenseEntry;
        } else {
            if (!currentBackupData.expenses) currentBackupData.expenses = [];
            currentBackupData.expenses.push(expenseEntry);
        }
        renderExpensesTable(); renderCashflowTable(); resetExpenseForm();
    });
    function resetExpenseForm() {
        expenseForm.reset();
        expenseOngoingCheckbox.checked = true; expenseEndDateInput.disabled = true; expenseEndDateInput.value = '';
        expenseFrequencySelect.value = 'Único'; expenseIsRealCheckbox.checked = false;
        if (expenseCategorySelect.options.length > 0 && expenseCategorySelect.value === "") {
            if (expenseCategorySelect.options[0].value !== "") expenseCategorySelect.selectedIndex = 0;
            else if (expenseCategorySelect.options.length > 1) expenseCategorySelect.selectedIndex = 1;
        }
        addExpenseButton.textContent = 'Agregar Gasto'; cancelEditExpenseButton.style.display = 'none';
        editingExpenseIndex = null;
        expenseStartDateInput.value = getISODateString(currentBackupData && currentBackupData.analysis_start_date ? new Date(currentBackupData.analysis_start_date) : new Date());
        updateRemoveCategoryButtonState();
    }
    cancelEditExpenseButton.addEventListener('click', resetExpenseForm);
    function renderExpensesTable() {
        if (!expensesTableView || !currentBackupData || !currentBackupData.expenses) return;
        expensesTableView.innerHTML = '';
        const searchTerm = searchExpenseInput.value.toLowerCase();
        const filteredExpenses = currentBackupData.expenses.filter(expense =>
            expense.name.toLowerCase().includes(searchTerm) ||
            formatCurrencyJS(expense.amount, currentBackupData.display_currency_symbol || '$').toLowerCase().includes(searchTerm) ||
            expense.category.toLowerCase().includes(searchTerm) ||
            expense.frequency.toLowerCase().includes(searchTerm)
        );
        filteredExpenses.forEach((expense) => {
            const originalIndex = currentBackupData.expenses.findIndex(exp => exp === expense);
            const row = expensesTableView.insertRow();
            row.insertCell().textContent = expense.name;
            row.insertCell().textContent = formatCurrencyJS(expense.amount, currentBackupData.display_currency_symbol || '$');
            row.insertCell().textContent = expense.category;
            row.insertCell().textContent = expense.frequency;
            row.insertCell().textContent = expense.start_date ? getISODateString(new Date(expense.start_date)) : 'N/A';
            row.insertCell().textContent = expense.end_date ? getISODateString(new Date(expense.end_date)) : (expense.frequency === 'Único' ? 'N/A (Único)' : 'Recurrente');
            row.insertCell().textContent = expense.is_real ? 'Sí' : 'No';
            const actionsCell = row.insertCell();
            const editButton = document.createElement('button'); editButton.textContent = 'Editar'; editButton.classList.add('small-button');
            editButton.onclick = () => loadExpenseForEdit(originalIndex); actionsCell.appendChild(editButton);
            const deleteButton = document.createElement('button'); deleteButton.textContent = 'Eliminar'; deleteButton.classList.add('small-button', 'danger');
            deleteButton.onclick = () => deleteExpense(originalIndex); actionsCell.appendChild(deleteButton);
        });
    }
    searchExpenseInput.addEventListener('input', renderExpensesTable);
    function loadExpenseForEdit(index) {
        const expense = currentBackupData.expenses[index];
        expenseNameInput.value = expense.name; expenseAmountInput.value = expense.amount;
        expenseCategorySelect.value = expense.category; expenseFrequencySelect.value = expense.frequency;
        expenseStartDateInput.value = expense.start_date ? getISODateString(new Date(expense.start_date)) : '';
        expenseIsRealCheckbox.checked = expense.is_real || false;
        const isUnico = expense.frequency === 'Único';
        expenseOngoingCheckbox.disabled = isUnico;
        if (isUnico) {
            expenseOngoingCheckbox.checked = false; expenseEndDateInput.value = ''; expenseEndDateInput.disabled = true;
        } else {
            expenseOngoingCheckbox.checked = !expense.end_date;
            expenseEndDateInput.value = expense.end_date ? getISODateString(new Date(expense.end_date)) : '';
            expenseEndDateInput.disabled = expenseOngoingCheckbox.checked;
        }
        addExpenseButton.textContent = 'Guardar Cambios'; cancelEditExpenseButton.style.display = 'inline-block';
        editingExpenseIndex = index; document.getElementById('gastos').scrollIntoView({ behavior: 'smooth' });
        updateRemoveCategoryButtonState();
    }
    function deleteExpense(index) {
        if (confirm(`¿Eliminar gasto "${currentBackupData.expenses[index].name}"?`)) {
            currentBackupData.expenses.splice(index, 1);
            renderExpensesTable(); renderCashflowTable();
            if (editingExpenseIndex === index) resetExpenseForm();
            else if (editingExpenseIndex !== null && editingExpenseIndex > index) editingExpenseIndex--;
        }
    }

    // --- LÓGICA PESTAÑA PRESUPUESTOS ---
    function resetBudgetForm() {
        budgetForm.reset();
        if (budgetCategorySelect.options.length > 0) budgetCategorySelect.selectedIndex = 0;
        budgetAmountInput.value = '';
    }
    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = budgetCategorySelect.value;
        const amount = parseFloat(budgetAmountInput.value);
        if (!category) { alert("Selecciona una categoría."); return; }
        if (isNaN(amount) || amount < 0) { alert("Ingresa un monto válido."); return; }
        if (!isFirebaseKeySafe(category)) { alert(`Categoría "${category}" con nombre no permitido.`); return; }
        if (!currentBackupData.budgets) currentBackupData.budgets = {};
        currentBackupData.budgets[category] = amount;
        renderBudgetsTable(); renderBudgetSummaryTable(); renderCashflowTable();
        alert(`Presupuesto para "${category}" guardado como ${formatCurrencyJS(amount, currentBackupData.display_currency_symbol || '$')}.`);
    });
    budgetCategorySelect.addEventListener('change', () => {
        const selectedCategory = budgetCategorySelect.value;
        budgetAmountInput.value = (selectedCategory && currentBackupData && currentBackupData.budgets) ? (currentBackupData.budgets[selectedCategory] || '0') : '0';
    });
    function renderBudgetsTable() {
        if (!budgetsTableView || !currentBackupData || !currentBackupData.expense_categories) return;
        budgetsTableView.innerHTML = '';
        const sortedCategories = Object.keys(currentBackupData.expense_categories).sort();
        sortedCategories.forEach(catName => {
            const catType = currentBackupData.expense_categories[catName];
            const budgetAmount = (currentBackupData.budgets && currentBackupData.budgets[catName] !== undefined) ? currentBackupData.budgets[catName] : 0;
            const row = budgetsTableView.insertRow();
            row.insertCell().textContent = catName;
            row.insertCell().textContent = catType;
            row.insertCell().textContent = formatCurrencyJS(budgetAmount, currentBackupData.display_currency_symbol || '$');
            row.addEventListener('click', () => { budgetCategorySelect.value = catName; budgetAmountInput.value = budgetAmount; });
        });
    }
    function renderBudgetSummaryTable() {
        if (!budgetSummaryTableBody || !currentBackupData) return;
        budgetSummaryTableBody.innerHTML = '';
        if (!currentBackupData.analysis_start_date || !currentBackupData.expenses || !currentBackupData.budgets || !currentBackupData.expense_categories) {
            const row = budgetSummaryTableBody.insertRow();
            const cell = row.insertCell(); cell.colSpan = 5; cell.textContent = "Datos insuficientes."; cell.style.textAlign = "center";
            return;
        }
        const analysisStartDate = new Date(currentBackupData.analysis_start_date);
        const currentMonth = analysisStartDate.getUTCMonth();
        const currentYear = analysisStartDate.getUTCFullYear();
        const expensesThisMonth = {};
        (currentBackupData.expenses || []).forEach(exp => {
            if (!exp.start_date) return;
            const expStartDate = new Date(exp.start_date);
            let amountForSummary = 0;
            if (exp.frequency === "Único") { if (expStartDate.getUTCFullYear() === currentYear && expStartDate.getUTCMonth() === currentMonth) amountForSummary = exp.amount; }
            else if (exp.frequency === "Mensual") { if (expStartDate <= new Date(Date.UTC(currentYear, currentMonth + 1, 0)) && (!exp.end_date || new Date(exp.end_date) >= new Date(Date.UTC(currentYear, currentMonth, 1)))) amountForSummary = exp.amount; }
            else if (exp.frequency === "Semanal") { if (expStartDate <= new Date(Date.UTC(currentYear, currentMonth + 1, 0)) && (!exp.end_date || new Date(exp.end_date) >= new Date(Date.UTC(currentYear, currentMonth, 1)))) amountForSummary = exp.amount * (52 / 12); } 
            else if (exp.frequency === "Bi-semanal") { 
                let paydays_in_month = 0;
                let current_pay_date = new Date(expStartDate.getTime());
                const month_start_date = new Date(Date.UTC(currentYear, currentMonth, 1));
                const month_end_date = new Date(Date.UTC(currentYear, currentMonth + 1, 0));
                while (current_pay_date <= month_end_date && (!exp.end_date || current_pay_date <= new Date(exp.end_date))) {
                    if (current_pay_date >= month_start_date) {
                        paydays_in_month++;
                    }
                    current_pay_date = addWeeks(current_pay_date, 2);
                }
                amountForSummary = exp.amount * paydays_in_month;
            }
            if (amountForSummary > 0) expensesThisMonth[exp.category] = (expensesThisMonth[exp.category] || 0) + amountForSummary;
        });

        (currentBackupData.incomes || []).forEach(reimbInc => {
            if (!reimbInc.is_reimbursement || !reimbInc.reimbursement_category || !reimbInc.start_date) return;
            const reimbStartDate = new Date(reimbInc.start_date);
            if (reimbStartDate.getUTCFullYear() === currentYear && reimbStartDate.getUTCMonth() === currentMonth) {
                let amountToReimburse = reimbInc.net_monthly;
                if (reimbInc.frequency === "Semanal") amountToReimburse = reimbInc.net_monthly * (52 / 12);
                else if (reimbInc.frequency === "Bi-semanal") {
                    let paydays_in_month = 0;
                    let current_pay_date = new Date(reimbStartDate.getTime());
                    const month_start_date = new Date(Date.UTC(currentYear, currentMonth, 1));
                    const month_end_date = new Date(Date.UTC(currentYear, currentMonth + 1, 0));
                    while (current_pay_date <= month_end_date && (!reimbInc.end_date || current_pay_date <= new Date(reimbInc.end_date))) {
                        if (current_pay_date >= month_start_date) {
                            paydays_in_month++;
                        }
                        current_pay_date = addWeeks(current_pay_date, 2);
                    }
                    amountToReimburse = reimbInc.net_monthly * paydays_in_month;
                }

                if (expensesThisMonth[reimbInc.reimbursement_category]) {
                    expensesThisMonth[reimbInc.reimbursement_category] = Math.max(0, expensesThisMonth[reimbInc.reimbursement_category] - amountToReimburse);
                }
            }
        });


        const sortedCategories = Object.keys(currentBackupData.expense_categories).sort();
        sortedCategories.forEach(catName => {
            const budget = currentBackupData.budgets[catName] || 0;
            const spent = expensesThisMonth[catName] || 0;
            const difference = budget - spent;
            const percentageSpent = budget > 0 ? (spent / budget * 100) : 0;
            const row = budgetSummaryTableBody.insertRow();
            row.insertCell().textContent = catName;
            row.insertCell().textContent = formatCurrencyJS(budget, currentBackupData.display_currency_symbol);
            row.insertCell().textContent = formatCurrencyJS(spent, currentBackupData.display_currency_symbol);
            const diffCell = row.insertCell(); diffCell.textContent = formatCurrencyJS(difference, currentBackupData.display_currency_symbol);
            diffCell.classList.toggle('text-red', difference < 0); diffCell.classList.toggle('text-green', difference > 0 && budget > 0);
            const percCell = row.insertCell(); percCell.textContent = `${percentageSpent.toFixed(1)}%`;
            if (budget > 0) { if (percentageSpent > 100) percCell.classList.add('text-red'); else if (percentageSpent >= 80) percCell.classList.add('text-orange'); else percCell.classList.add('text-green'); }
        });
    }

    // --- LÓGICA PESTAÑA REGISTRO PAGOS ---
    function setupPaymentPeriodSelectors() {
        currentPaymentViewDate = (currentBackupData && currentBackupData.analysis_start_date) ? new Date(currentBackupData.analysis_start_date) : new Date();
        const analysisStartDate = new Date(currentPaymentViewDate);
        const analysisEndDate = addMonths(new Date(analysisStartDate), (currentBackupData ? currentBackupData.analysis_duration : 12));
        paymentYearSelect.innerHTML = '';
        const startYear = Math.min(analysisStartDate.getUTCFullYear(), new Date().getUTCFullYear()) - 2;
        const endYear = Math.max(analysisEndDate.getUTCFullYear(), new Date().getUTCFullYear()) + 5;
        for (let y = startYear; y <= endYear; y++) { const option = document.createElement('option'); option.value = y; option.textContent = y; paymentYearSelect.appendChild(option); }
        paymentYearSelect.value = currentPaymentViewDate.getUTCFullYear();
        paymentMonthSelect.innerHTML = '';
        MONTH_NAMES_FULL_ES.forEach((monthName, index) => { const option = document.createElement('option'); option.value = index; option.textContent = monthName; paymentMonthSelect.appendChild(option); });
        paymentMonthSelect.value = currentPaymentViewDate.getUTCMonth();
        paymentWeekSelect.innerHTML = '';
        for (let w = 1; w <= 53; w++) { const option = document.createElement('option'); option.value = w; option.textContent = `Semana ${w}`; paymentWeekSelect.appendChild(option); }
        const [, currentIsoWeek] = getWeekNumber(currentPaymentViewDate); paymentWeekSelect.value = currentIsoWeek;
        updatePaymentPeriodSelectorVisibility();
        [paymentYearSelect, paymentMonthSelect, paymentWeekSelect].forEach(sel => { sel.removeEventListener('change', renderPaymentsTableForCurrentPeriod); sel.addEventListener('change', renderPaymentsTableForCurrentPeriod); });
    }
    function updatePaymentPeriodSelectorVisibility() {
        const isWeekly = currentBackupData && currentBackupData.analysis_periodicity === "Semanal";
        paymentsTabTitle.textContent = isWeekly ? "Registro de Pagos Semanales" : "Registro de Pagos Mensuales";
        paymentMonthSelect.style.display = isWeekly ? 'none' : 'inline-block';
        paymentWeekSelect.style.display = isWeekly ? 'inline-block' : 'none';
    }
    prevPeriodButton.addEventListener('click', () => navigatePaymentPeriod(-1));
    nextPeriodButton.addEventListener('click', () => navigatePaymentPeriod(1));
    function navigatePaymentPeriod(direction) {
        const isWeekly = currentBackupData.analysis_periodicity === "Semanal";
        let year = parseInt(paymentYearSelect.value);
        if (isWeekly) {
            let week = parseInt(paymentWeekSelect.value);
            const newDate = addWeeks(getMondayOfWeek(year, week), direction);
            const [newYear, newWeekNumber] = getWeekNumber(newDate);
            paymentYearSelect.value = newYear; paymentWeekSelect.value = newWeekNumber;
        } else {
            let month = parseInt(paymentMonthSelect.value);
            const newMonthDate = new Date(Date.UTC(year, month, 15));
            newMonthDate.setUTCMonth(newMonthDate.getUTCMonth() + direction);
            paymentYearSelect.value = newMonthDate.getUTCFullYear(); paymentMonthSelect.value = newMonthDate.getUTCMonth();
        }
        renderPaymentsTableForCurrentPeriod();
    }
    function renderPaymentsTableForCurrentPeriod() {
        if (!paymentsTableView || !currentBackupData || !currentBackupData.expenses) { if (paymentsTableView) paymentsTableView.innerHTML = '<tr><td colspan="6">No hay datos de gastos.</td></tr>'; return; }
        updatePaymentPeriodSelectorVisibility();
        const isWeeklyView = currentBackupData.analysis_periodicity === "Semanal";
        const year = parseInt(paymentYearSelect.value);
        let periodStart, periodEnd, paymentLogPeriodKeyPart;
        if (isWeeklyView) {
            const week = parseInt(paymentWeekSelect.value);
            periodStart = getMondayOfWeek(year, week); periodEnd = addWeeks(new Date(periodStart), 1); periodEnd.setUTCDate(periodEnd.getUTCDate() - 1);
            paymentLogPeriodKeyPart = week;
        } else {
            const monthIndex = parseInt(paymentMonthSelect.value);
            periodStart = new Date(Date.UTC(year, monthIndex, 1)); periodEnd = new Date(Date.UTC(year, monthIndex + 1, 0));
            paymentLogPeriodKeyPart = monthIndex + 1;
        }
        currentPaymentViewDate = periodStart;
        paymentsTableView.innerHTML = ''; let expensesInPeriodFound = false;
        currentBackupData.expenses.forEach(expense => {
            if (!expense.start_date) return;
            const expStartDate = new Date(expense.start_date); const expEndDate = expense.end_date ? new Date(expense.end_date) : null;
            let occursInPeriod = false;
            if (expense.frequency === "Único") { if (expStartDate >= periodStart && expStartDate <= periodEnd) occursInPeriod = true; }
            else if (expense.frequency === "Mensual") { if (isWeeklyView) { const payDay = expStartDate.getUTCDate(); const payDateThisMonth = new Date(Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth(), payDay)); if (payDateThisMonth >= periodStart && payDateThisMonth <= periodEnd) occursInPeriod = true; } else { if (expStartDate <= periodEnd && (!expEndDate || expEndDate >= periodStart)) occursInPeriod = true; } }
            else if (expense.frequency === "Semanal") { if (expStartDate <= periodEnd && (!expEndDate || expEndDate >= periodStart)) occursInPeriod = true; } 
            else if (expense.frequency === "Bi-semanal") { if (expStartDate <= periodEnd && (!expEndDate || expEndDate >= periodStart)) { let paymentDate = new Date(expStartDate.getTime()); while (paymentDate <= periodEnd) { if (paymentDate >= periodStart) { occursInPeriod = true; break; } paymentDate = addWeeks(paymentDate, 2); } } }
            if (occursInPeriod) {
                expensesInPeriodFound = true; const row = paymentsTableView.insertRow();
                row.insertCell().textContent = expense.name; row.insertCell().textContent = formatCurrencyJS(expense.amount, currentBackupData.display_currency_symbol);
                row.insertCell().textContent = expense.category; row.insertCell().textContent = currentBackupData.expense_categories[expense.category] || 'Variable';
                row.insertCell().textContent = expense.is_real ? 'Sí' : 'No';
                const paidCell = row.insertCell(); const checkbox = document.createElement('input'); checkbox.type = 'checkbox';
                const paymentKey = `${expense.name}|${year}|${paymentLogPeriodKeyPart}`;
                checkbox.checked = currentBackupData.payments && currentBackupData.payments[paymentKey] === true;
                checkbox.dataset.paymentKey = paymentKey;
                checkbox.addEventListener('change', (e) => { if (!currentBackupData.payments) currentBackupData.payments = {}; currentBackupData.payments[e.target.dataset.paymentKey] = e.target.checked; });
                paidCell.appendChild(checkbox);
            }
        });
        if (!expensesInPeriodFound) { const row = paymentsTableView.insertRow(); const cell = row.insertCell(); cell.colSpan = 6; cell.textContent = "No hay gastos programados para este período."; cell.style.textAlign = "center"; }
    }

    // --- LÓGICA PESTAÑA FLUJO DE CAJA ---
    function renderCashflowTable() {
        if (!currentBackupData || !cashflowTableBody || !cashflowTableHead) return;
        cashflowTableHead.innerHTML = ''; cashflowTableBody.innerHTML = '';
        let analysisStartDateObj = currentBackupData.analysis_start_date;
        if (typeof analysisStartDateObj === 'string') analysisStartDateObj = new Date(analysisStartDateObj + 'T00:00:00Z');
        if (!(analysisStartDateObj instanceof Date) || isNaN(analysisStartDateObj)) { cashflowTableBody.innerHTML = '<tr><td colspan="2">Error: Fecha de inicio inválida.</td></tr>'; return; }
        const tempCalcData = { ...currentBackupData, analysis_start_date: analysisStartDateObj, incomes: (currentBackupData.incomes || []).map(inc => ({ ...inc, start_date: inc.start_date ? new Date(inc.start_date) : null, end_date: inc.end_date ? new Date(inc.end_date) : null })), expenses: (currentBackupData.expenses || []).map(exp => ({ ...exp, start_date: exp.start_date ? new Date(exp.start_date) : null, end_date: exp.end_date ? new Date(exp.end_date) : null })), };
        const { periodDates, income_p, fixed_exp_p, var_exp_p, net_flow_p, end_bal_p, expenses_by_cat_p } = calculateCashFlowData(tempCalcData);
        if (!periodDates || periodDates.length === 0) { cashflowTableBody.innerHTML = '<tr><td colspan="2">No hay datos para el período.</td></tr>'; if (cashflowChartInstance) cashflowChartInstance.destroy(); cashflowChartInstance = null; if (chartMessage) chartMessage.textContent = "No hay datos para graficar."; return; }
        const symbol = currentBackupData.display_currency_symbol || "$"; const periodicity = currentBackupData.analysis_periodicity; const initialBalance = parseFloat(currentBackupData.analysis_initial_balance);
        const startQDate = analysisStartDateObj; const startStr = `${('0' + startQDate.getUTCDate()).slice(-2)}/${('0' + (startQDate.getUTCMonth() + 1)).slice(-2)}/${startQDate.getUTCFullYear()}`;
        const durationUnit = periodicity === "Semanal" ? "Semanas" : "Meses"; cashflowTitle.textContent = `Proyección Flujo de Caja (${currentBackupData.analysis_duration} ${durationUnit} desde ${startStr})`;
        const headerRow = cashflowTableHead.insertRow(); const thConcept = document.createElement('th'); thConcept.textContent = 'Categoría / Concepto'; headerRow.appendChild(thConcept);
        periodDates.forEach(d => { const th = document.createElement('th'); if (periodicity === "Semanal") { const [year, week] = getWeekNumber(d); const mondayOfWeek = getMondayOfWeek(year, week); th.innerHTML = `Sem ${week} (${DATE_WEEK_START_FORMAT(mondayOfWeek)})<br>${year}`; } else { th.innerHTML = `${MONTH_NAMES_ES[d.getUTCMonth()]}<br>${d.getUTCFullYear()}`; } headerRow.appendChild(th); });
        const cf_row_definitions = [{ key: 'START_BALANCE', label: "Saldo Inicial", isBold: true, isHeaderBg: true }, { key: 'NET_INCOME', label: "Ingreso Total Neto", isBold: true },];
        const fixedCategories = currentBackupData.expense_categories ? Object.keys(currentBackupData.expense_categories).filter(cat => currentBackupData.expense_categories[cat] === "Fijo").sort() : [];
        const variableCategories = currentBackupData.expense_categories ? Object.keys(currentBackupData.expense_categories).filter(cat => currentBackupData.expense_categories[cat] === "Variable").sort() : [];
        fixedCategories.forEach(cat => cf_row_definitions.push({ key: `CAT_${cat}`, label: cat, isIndent: true, category: cat })); cf_row_definitions.push({ key: 'FIXED_EXP_TOTAL', label: "Total Gastos Fijos", isBold: true, isHeaderBg: true });
        variableCategories.forEach(cat => cf_row_definitions.push({ key: `CAT_${cat}`, label: cat, isIndent: true, category: cat })); cf_row_definitions.push({ key: 'VAR_EXP_TOTAL', label: "Total Gastos Variables", isBold: true, isHeaderBg: true });
        cf_row_definitions.push({ key: 'NET_FLOW', label: "Flujo Neto del Período", isBold: true }); cf_row_definitions.push({ key: 'END_BALANCE', label: "Saldo Final Estimado", isBold: true, isHeaderBg: true });
        cf_row_definitions.forEach((def, rowIndex) => {
            const tr = cashflowTableBody.insertRow(); const tdLabel = tr.insertCell(); tdLabel.textContent = def.isIndent ? `  ${def.label}` : def.label;
            if (def.isBold) tdLabel.classList.add('bold'); if (def.isHeaderBg) tr.classList.add('bg-header'); else if (rowIndex % 2 !== 0 && !def.isHeaderBg) tr.classList.add('bg-alt-row');
            for (let i = 0; i < periodDates.length; i++) {
                const tdValue = tr.insertCell(); let value; let colorClass = '';
                switch (def.key) {
                    case 'START_BALANCE': value = (i === 0) ? initialBalance : end_bal_p[i - 1]; break; case 'NET_INCOME': value = income_p[i]; break;
                    case 'FIXED_EXP_TOTAL': value = -fixed_exp_p[i]; break; case 'VAR_EXP_TOTAL': value = -var_exp_p[i]; break;
                    case 'NET_FLOW': value = net_flow_p[i]; break; case 'END_BALANCE': value = end_bal_p[i]; colorClass = value >= 0 ? 'text-blue' : 'text-red'; break;
                    default: value = (def.category && expenses_by_cat_p[i]) ? -(expenses_by_cat_p[i][def.category] || 0) : 0;
                }
                tdValue.textContent = formatCurrencyJS(value, symbol); if (colorClass) tdValue.classList.add(colorClass); if (def.isBold) tdValue.classList.add('bold');
            }
        });
        renderCashflowChart(periodDates, income_p, fixed_exp_p.map((val, idx) => val + var_exp_p[idx]), net_flow_p, end_bal_p); renderBudgetSummaryTable();
    }

    function calculateCashFlowData(data) {
        const startDate = data.analysis_start_date; const duration = parseInt(data.analysis_duration, 10); const periodicity = data.analysis_periodicity; const initialBalance = parseFloat(data.analysis_initial_balance);
        let periodDates = []; let income_p = Array(duration).fill(0.0); let fixed_exp_p = Array(duration).fill(0.0); let var_exp_p = Array(duration).fill(0.0); let net_flow_p = Array(duration).fill(0.0); let end_bal_p = Array(duration).fill(0.0); let expenses_by_cat_p = Array(duration).fill(null).map(() => ({}));
        let currentDate = new Date(startDate.getTime()); let currentBalance = initialBalance;
        const fixedCategories = data.expense_categories ? Object.keys(data.expense_categories).filter(cat => data.expense_categories[cat] === "Fijo").sort() : [];
        const variableCategories = data.expense_categories ? Object.keys(data.expense_categories).filter(cat => data.expense_categories[cat] === "Variable").sort() : [];
        const orderedCategories = [...fixedCategories, ...variableCategories];
        orderedCategories.forEach(cat => { for (let i = 0; i < duration; i++) { expenses_by_cat_p[i][cat] = 0.0; } });

        for (let i = 0; i < duration; i++) {
            const p_start = new Date(currentDate.getTime()); let p_end;
            if (periodicity === "Mensual") { p_end = addMonths(new Date(p_start.getTime()), 1); p_end.setUTCDate(p_end.getUTCDate() - 1); } else { p_end = addWeeks(new Date(p_start.getTime()), 1); p_end.setUTCDate(p_end.getUTCDate() - 1); }
            periodDates.push(p_start); let p_inc_total = 0.0;

            (data.incomes || []).forEach(inc => {
                if (!inc.start_date) return;
                if (inc.is_reimbursement) return; // Exclude reimbursements from direct income calculation here

                const inc_start = inc.start_date; const inc_end = inc.end_date; const net_amount = parseFloat(inc.net_monthly || 0); const inc_freq = inc.frequency || "Mensual";
                const isActiveRange = (inc_start <= p_end && (inc_end === null || inc_end >= p_start)); if (!isActiveRange) return;
                let income_to_add = 0.0;
                if (inc_freq === "Mensual") { if (periodicity === "Mensual") income_to_add = net_amount; else if (periodicity === "Semanal") { const payDay = inc_start.getUTCDate(); const payDate = new Date(Date.UTC(p_start.getUTCFullYear(), p_start.getUTCMonth(), payDay)); if (p_start <= payDate && payDate <= p_end) income_to_add = net_amount; } }
                else if (inc_freq === "Único") { if (p_start <= inc_start && inc_start <= p_end) income_to_add = net_amount; }
                else if (inc_freq === "Semanal") { if (periodicity === "Semanal") income_to_add = net_amount; else if (periodicity === "Mensual") income_to_add = net_amount * (52 / 12); }
                else if (inc_freq === "Bi-semanal") { if (periodicity === "Semanal") { let paymentDate = new Date(inc_start.getTime()); while (paymentDate <= p_end && (!inc_end || paymentDate <= inc_end)) { if (paymentDate >= p_start) { income_to_add = net_amount; break; } paymentDate = addWeeks(paymentDate, 2); } } else if (periodicity === "Mensual") { let paydays_in_month = 0; let current_pay_date = new Date(inc_start.getTime()); while (current_pay_date <= p_end && (!inc_end || current_pay_date <= inc_end)) { if (current_pay_date >= p_start) paydays_in_month++; current_pay_date = addWeeks(current_pay_date, 2); } income_to_add = net_amount * paydays_in_month; } }
                p_inc_total += income_to_add;
            });
            income_p[i] = p_inc_total;

            let p_fix_exp_total_for_period = 0.0;
            let p_var_exp_total_for_period = 0.0;

            (data.expenses || []).forEach(exp => {
                if (!exp.start_date) return; const e_start = exp.start_date; const e_end = exp.end_date; const amt_raw = parseFloat(exp.amount || 0); const freq = exp.frequency || "Mensual"; const typ = exp.type || (data.expense_categories && data.expense_categories[exp.category]) || "Variable"; const cat = exp.category;
                if (amt_raw < 0 || !cat || !orderedCategories.includes(cat)) return;
                const isActiveRange = (e_start <= p_end && (e_end === null || e_end >= p_start)); if (!isActiveRange) return;
                let exp_add_this_period = 0.0;
                if (freq === "Mensual") { if (periodicity === "Mensual") exp_add_this_period = amt_raw; else if (periodicity === "Semanal") { const payDay = e_start.getUTCDate(); const payDate = new Date(Date.UTC(p_start.getUTCFullYear(), p_start.getUTCMonth(), payDay)); if (p_start <= payDate && payDate <= p_end) exp_add_this_period = amt_raw; } }
                else if (freq === "Único") { if (p_start <= e_start && e_start <= p_end) exp_add_this_period = amt_raw; }
                else if (freq === "Semanal") { if (periodicity === "Semanal") exp_add_this_period = amt_raw; else if (periodicity === "Mensual") exp_add_this_period = amt_raw * (52 / 12); }
                else if (freq === "Bi-semanal") { if (periodicity === "Semanal") { let paymentDate = new Date(e_start.getTime()); while (paymentDate <= p_end && (!e_end || paymentDate <= e_end)) { if (paymentDate >= p_start) { exp_add_this_period = amt_raw; break; } paymentDate = addWeeks(paymentDate, 2); } } else if (periodicity === "Mensual") { let paydays_in_month = 0; let current_pay_date = new Date(e_start.getTime()); while (current_pay_date <= p_end && (!e_end || current_pay_date <= e_end)) { if (current_pay_date >= p_start) paydays_in_month++; current_pay_date = addWeeks(current_pay_date, 2); } exp_add_this_period = amt_raw * paydays_in_month; } }
                if (exp_add_this_period > 0) {
                    expenses_by_cat_p[i][cat] = (expenses_by_cat_p[i][cat] || 0) + exp_add_this_period;
                    // Totals will be recalculated after reimbursements
                }
            });

            // Apply reimbursements to expenses of this period
            (data.incomes || []).forEach(reimbInc => {
                if (!reimbInc.is_reimbursement || !reimbInc.reimbursement_category || !reimbInc.start_date) return;

                const reimb_start = reimbInc.start_date;
                const reimb_end = reimbInc.end_date;
                const reimb_amount_raw = parseFloat(reimbInc.net_monthly || 0);
                const reimb_freq = reimbInc.frequency || "Mensual";
                const reimb_cat = reimbInc.reimbursement_category;

                const isActiveRange = (reimb_start <= p_end && (reimb_end === null || reimb_end >= p_start));
                if (!isActiveRange) return;

                let amount_of_reimbursement_in_this_period = 0.0;
                if (reimb_freq === "Mensual") {
                    if (periodicity === "Mensual") { amount_of_reimbursement_in_this_period = reimb_amount_raw; }
                    else if (periodicity === "Semanal") {
                        const payDay = reimb_start.getUTCDate();
                        const payDateForReimb = new Date(Date.UTC(p_start.getUTCFullYear(), p_start.getUTCMonth(), payDay));
                        if (payDateForReimb >= p_start && payDateForReimb <= p_end) {
                            amount_of_reimbursement_in_this_period = reimb_amount_raw;
                        }
                    }
                } else if (reimb_freq === "Único") {
                    if (p_start <= reimb_start && reimb_start <= p_end) { amount_of_reimbursement_in_this_period = reimb_amount_raw; }
                } else if (reimb_freq === "Semanal") {
                    if (periodicity === "Semanal") { amount_of_reimbursement_in_this_period = reimb_amount_raw; }
                    else if (periodicity === "Mensual") {
                        amount_of_reimbursement_in_this_period = reimb_amount_raw * (52 / 12);
                    }
                } else if (reimb_freq === "Bi-semanal") {
                    if (periodicity === "Semanal") {
                        let paymentDate = new Date(reimb_start.getTime());
                        while (paymentDate <= p_end && (!reimb_end || paymentDate <= reimb_end)) {
                            if (paymentDate >= p_start) { amount_of_reimbursement_in_this_period = reimb_amount_raw; break; }
                            paymentDate = addWeeks(paymentDate, 2);
                        }
                    } else if (periodicity === "Mensual") {
                        let occurrences = 0; let checkDate = new Date(reimb_start.getTime());
                        while (checkDate <= p_end && (!reimb_end || checkDate <= reimb_end)) {
                            if (checkDate >= p_start) occurrences++;
                            checkDate = addWeeks(checkDate, 2);
                        }
                        amount_of_reimbursement_in_this_period = reimb_amount_raw * occurrences;
                    }
                }

                if (amount_of_reimbursement_in_this_period > 0 && expenses_by_cat_p[i][reimb_cat] !== undefined) {
                    expenses_by_cat_p[i][reimb_cat] = Math.max(0, expenses_by_cat_p[i][reimb_cat] - amount_of_reimbursement_in_this_period);
                }
            });
            
            // Recalculate total fixed/variable expenses after reimbursements
            p_fix_exp_total_for_period = 0;
            p_var_exp_total_for_period = 0;
            for (const cat_name_final in expenses_by_cat_p[i]) {
                const cat_expense_final = expenses_by_cat_p[i][cat_name_final];
                const expenseTypeFinal = data.expense_categories[cat_name_final] || "Variable";
                if (expenseTypeFinal === "Fijo") {
                    p_fix_exp_total_for_period += cat_expense_final;
                } else {
                    p_var_exp_total_for_period += cat_expense_final;
                }
            }

            fixed_exp_p[i] = p_fix_exp_total_for_period;
            var_exp_p[i] = p_var_exp_total_for_period;

            const net_flow = p_inc_total - (fixed_exp_p[i] + var_exp_p[i]); net_flow_p[i] = net_flow;
            const end_bal = currentBalance + net_flow; end_bal_p[i] = end_bal;
            currentBalance = end_bal; currentDate = (periodicity === "Mensual") ? addMonths(currentDate, 1) : addWeeks(currentDate, 1);
        }
        return { periodDates, income_p, fixed_exp_p, var_exp_p, net_flow_p, end_bal_p, expenses_by_cat_p };
    }

    // --- LÓGICA PESTAÑA GRÁFICO ---
    function renderCashflowChart(periodDates, incomes, totalExpenses, netFlows, endBalances) {
        if (!cashflowChartCanvas) return; if (cashflowChartInstance) cashflowChartInstance.destroy();
        if (!periodDates || periodDates.length === 0) { if (chartMessage) chartMessage.textContent = "El gráfico se generará después de calcular el flujo de caja."; return; }
        if (chartMessage) chartMessage.textContent = "";
        const labels = periodDates.map(date => currentBackupData.analysis_periodicity === "Semanal" ? `Sem ${getWeekNumber(date)[1]} ${getWeekNumber(date)[0]}` : `${MONTH_NAMES_ES[date.getUTCMonth()]} ${date.getUTCFullYear()}`);
        cashflowChartInstance = new Chart(cashflowChartCanvas, {
            type: 'line',
            data: { labels: labels, datasets: [{ label: 'Saldo Final Estimado', data: endBalances, borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)', tension: 0.1, fill: false, pointRadius: 4, pointBackgroundColor: 'rgba(54, 162, 235, 1)', borderWidth: 2, order: 1, }, { label: 'Ingreso Total Neto', data: incomes, borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 1)', type: 'scatter', showLine: false, pointRadius: 6, pointStyle: 'circle', order: 2, }, { label: 'Gasto Total', data: totalExpenses.map(e => -e), borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 1)', type: 'scatter', showLine: false, pointRadius: 6, pointStyle: 'rectRot', order: 2, }, { label: 'Flujo Neto del Período', data: netFlows, borderColor: 'rgba(255, 206, 86, 1)', backgroundColor: 'rgba(255, 206, 86, 1)', type: 'scatter', showLine: false, pointRadius: 6, pointStyle: 'triangle', order: 2, }] },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { type: 'linear', display: true, position: 'left', title: { display: true, text: `Saldo / Flujos (${currentBackupData.display_currency_symbol || '$'})` } } }, plugins: { tooltip: { callbacks: { label: function (context) { let label = context.dataset.label || ''; if (label) label += ': '; if (context.parsed.y !== null) label += formatCurrencyJS(context.parsed.y, currentBackupData.display_currency_symbol || '$'); return label; } } }, legend: { position: 'top' } } }
        });
    }

    // --- LÓGICA PESTAÑA BABY STEPS ---
    function renderBabySteps() {
        if (!babyStepsContainer || !currentBackupData || !currentBackupData.baby_steps_status) return;
        babyStepsContainer.innerHTML = '';
        BABY_STEPS_DATA_JS.forEach((stepData, stepIndex) => {
            const stepDiv = document.createElement('div'); stepDiv.classList.add('baby-step');
            const title = document.createElement('h3'); title.textContent = stepData.title; stepDiv.appendChild(title);
            const description = document.createElement('p'); description.innerHTML = stepData.description.replace(/\n/g, '<br>'); stepDiv.appendChild(description);
            ['dos', 'donts'].forEach(listType => {
                if (stepData[listType] && stepData[listType].length > 0) {
                    const listTitle = document.createElement('h4'); listTitle.textContent = listType === 'dos' ? "✅ Qué haces:" : "❌ Qué no haces:"; stepDiv.appendChild(listTitle);
                    const ul = document.createElement('ul');
                    stepData[listType].forEach((itemText, itemIndex) => {
                        const li = document.createElement('li'); const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.id = `step-${stepIndex}-${listType}-${itemIndex}`;
                        if (currentBackupData.baby_steps_status[stepIndex] && currentBackupData.baby_steps_status[stepIndex][listType]) checkbox.checked = currentBackupData.baby_steps_status[stepIndex][listType][itemIndex] || false; else checkbox.checked = false;
                        checkbox.addEventListener('change', (e) => { if (currentBackupData.baby_steps_status[stepIndex] && currentBackupData.baby_steps_status[stepIndex][listType]) currentBackupData.baby_steps_status[stepIndex][listType][itemIndex] = e.target.checked; });
                        const label = document.createElement('label'); label.htmlFor = checkbox.id; label.textContent = itemText;
                        li.appendChild(checkbox); li.appendChild(label); ul.appendChild(li);
                    });
                    stepDiv.appendChild(ul);
                }
            });
            babyStepsContainer.appendChild(stepDiv);
        });
    }

    // --- LÓGICA PESTAÑA RECORDATORIOS ---
    function resetReminderForm() { reminderForm.reset(); }
    reminderForm.addEventListener('submit', (e) => {
        e.preventDefault(); const text = reminderTextInput.value.trim();
        if (!text) { alert("Ingresa el texto del recordatorio."); return; }
        if (!currentBackupData.reminders_todos) currentBackupData.reminders_todos = [];
        currentBackupData.reminders_todos.push({ text: text, completed: false });
        renderReminders(); resetReminderForm();
    });
    function renderReminders() {
        if (!pendingRemindersList || !completedRemindersList || !currentBackupData) return;
        pendingRemindersList.innerHTML = ''; completedRemindersList.innerHTML = '';
        (currentBackupData.reminders_todos || []).forEach((reminder, index) => {
            const li = document.createElement('li'); li.textContent = reminder.text; li.dataset.index = index;
            const toggleButton = document.createElement('button'); toggleButton.textContent = reminder.completed ? 'Marcar Pendiente' : 'Marcar Completado'; toggleButton.classList.add('small-button');
            toggleButton.addEventListener('click', () => { reminder.completed = !reminder.completed; renderReminders(); });
            const deleteButton = document.createElement('button'); deleteButton.textContent = 'Eliminar'; deleteButton.classList.add('small-button', 'danger');
            deleteButton.addEventListener('click', () => { if (confirm(`¿Eliminar recordatorio "${reminder.text}"?`)) { currentBackupData.reminders_todos.splice(index, 1); renderReminders(); } });
            const buttonContainer = document.createElement('div'); buttonContainer.classList.add('reminder-actions'); buttonContainer.appendChild(toggleButton); buttonContainer.appendChild(deleteButton); li.appendChild(buttonContainer);
            if (reminder.completed) { li.classList.add('completed'); completedRemindersList.appendChild(li); } else { pendingRemindersList.appendChild(li); }
        });
    }

    // --- LÓGICA PESTAÑA LOG (ACTUALIZADA) ---
    function renderLogTab() {
        if (!changeLogList) return;
        changeLogList.innerHTML = '';

        if (!changeLogEntries || changeLogEntries.length === 0) {
            const li = document.createElement('li');
            li.textContent = "No hay cambios registrados aún.";
            li.classList.add('log-entry-empty');
            changeLogList.appendChild(li);
            return;
        }

        changeLogEntries.forEach(entry => {
            const li = document.createElement('li');
            li.classList.add('log-entry');

            const headerDiv = document.createElement('div');
            headerDiv.classList.add('log-entry-header');

            const timestampSpan = document.createElement('span');
            timestampSpan.classList.add('log-timestamp');
            const date = new Date(entry.timestamp);
            timestampSpan.textContent = `[${date.toLocaleDateString('es-CL')} ${date.toLocaleTimeString('es-CL')}]`;

            const userSpan = document.createElement('span');
            userSpan.classList.add('log-user');
            userSpan.textContent = entry.user || "Desconocido";

            const messageSpan = document.createElement('span');
            messageSpan.classList.add('log-message');
            messageSpan.textContent = entry.message;

            headerDiv.appendChild(timestampSpan);
            headerDiv.appendChild(userSpan);
            headerDiv.appendChild(messageSpan);
            li.appendChild(headerDiv);

            if (entry.details && entry.details.length > 0) {
                const detailsUl = document.createElement('ul');
                detailsUl.classList.add('log-details-list');
                entry.details.forEach(detailMsg => {
                    const detailLi = document.createElement('li');
                    detailLi.textContent = detailMsg;
                    detailsUl.appendChild(detailLi);
                });
                li.appendChild(detailsUl);
            }
            changeLogList.appendChild(li);
        });
    }


    // --- FUNCIONES AUXILIARES DE FECHAS Y FORMATO ---
    function formatCurrencyJS(value, symbol = '$') { if (value === null || typeof value !== 'number' || isNaN(value)) return `${symbol}0`; return `${symbol}${Math.round(value).toLocaleString('es-CL')}`; }
    function addMonths(date, months) { const d = new Date(date.getTime()); d.setUTCMonth(d.getUTCMonth() + months); return d; }
    function addWeeks(date, weeks) { const d = new Date(date.getTime()); d.setUTCDate(d.getUTCDate() + (weeks * 7)); return d; }
    function getISODateString(date) { if (!(date instanceof Date) || isNaN(date.getTime())) return ''; return date.getUTCFullYear() + '-' + ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2); }
    function getWeekNumber(d) { const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7)); const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1)); const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7); return [date.getUTCFullYear(), weekNo]; }
    function getMondayOfWeek(year, week) { const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7)); const dayOfWeek = simple.getUTCDay(); const isoDayOfWeek = ((dayOfWeek + 6) % 7) + 1; const diff = isoDayOfWeek - 1; simple.setUTCDate(simple.getUTCDate() - diff); return simple; }
    function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getUTCDate(); }


    // --- INICIALIZACIÓN ---
    showLoginScreen();
    const today = new Date();
    const todayISO = getISODateString(today);
    incomeStartDateInput.value = todayISO;
    expenseStartDateInput.value = todayISO;
    analysisStartDateInput.value = todayISO;
    incomeEndDateInput.disabled = true;
    expenseEndDateInput.disabled = true;
    updateAnalysisDurationLabel();
    // updateUsdClpInfoLabel(); // No longer needed here, called by activateTab or showMainContentScreen
    incomeReimbursementCategoryContainer.style.display = 'none';
});
