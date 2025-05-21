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
        fetchBackups(); // fetchBackups will use the 'database' variable which is now set by initializeUserDatabase
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
        // signInWithEmailAndPassword uses the 'auth' instance from defaultApp (defined in config.js)
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                authStatus.textContent = `Error: ${error.message}`;
            });
    });

    logoutButton.addEventListener('click', () => {
        auth.signOut(); // This will trigger onAuthStateChanged
    });

    // Listener para cambios en el estado de autenticación
    // ESTA ES LA MODIFICACIÓN CLAVE:
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in.
            initializeUserDatabase(user.uid); // Set the correct database instance
            showDataSelectionScreen(user);
        } else {
            // User is signed out.
            initializeUserDatabase(null); // Revert to default database
            showLoginScreen();
        }
    });

    // --- CARGA DE VERSIONES (BACKUPS) ---
    // Esta función ahora usará la variable 'database' que fue establecida por initializeUserDatabase
    function fetchBackups() {
        loadingMessage.textContent = "Cargando lista de versiones...";
        loadingMessage.style.display = 'block';
        loadLatestVersionButton.disabled = true;

        // Asegurarse de que 'database' (de config.js) esté disponible
        if (!database) {
            console.error("Database service is not initialized. Cannot fetch backups.");
            loadingMessage.textContent = "Error: Servicio de base de datos no inicializado.";
            authStatus.textContent = "Error crítico: contactar soporte.";
            loadLatestVersionButton.disabled = true;
            return;
        }

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
            const latestKey = backupSelector.options[1].value; // Assumes first option is placeholder
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

        if (!database) {
            console.error("Database service is not initialized. Cannot load specific backup.");
            loadingMessage.textContent = "Error: Servicio de base de datos no inicializado.";
            alert("Error crítico al cargar datos. Contactar soporte.");
            return;
        }

        database.ref(`backups/${key}`).once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    currentBackupData = snapshot.val();
                    currentBackupKey = key;

                    // Ensure all expected data structures exist, provide defaults if not
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
                    if (!currentBackupData.payments) currentBackupData.payments = {}; // Initialize if not present
                    if (!currentBackupData.baby_steps_status || currentBackupData.baby_steps_status.length === 0) {
                        currentBackupData.baby_steps_status = BABY_STEPS_DATA_JS.map(step => ({
                            dos: new Array(step.dos.length).fill(false),
                            donts: new Array(step.donts.length).fill(false)
                        }));
                    }
                    if (!currentBackupData.reminders_todos) currentBackupData.reminders_todos = []; // Initialize if not present

                    // Handle change_log, ensuring it's an array and entries have a user
                    changeLogEntries = currentBackupData.change_log || [];
                    if (!Array.isArray(changeLogEntries)) { // Defensive check
                        changeLogEntries = [];
                    }
                    changeLogEntries.forEach(entry => {
                        if (!entry.user) { // For older data that might not have user
                            entry.user = "Desconocido (Versión Antigua)";
                        }
                    });
                    currentBackupData.change_log = changeLogEntries;


                    // Convert date strings to Date objects, and provide defaults for settings
                    currentBackupData.analysis_start_date = currentBackupData.analysis_start_date ? new Date(currentBackupData.analysis_start_date + 'T00:00:00Z') : new Date(); // Default to today if missing
                    currentBackupData.analysis_duration = parseInt(currentBackupData.analysis_duration, 10) || 12;
                    currentBackupData.analysis_periodicity = currentBackupData.analysis_periodicity || "Mensual";
                    currentBackupData.analysis_initial_balance = parseFloat(currentBackupData.analysis_initial_balance) || 0;
                    currentBackupData.display_currency_symbol = currentBackupData.display_currency_symbol || "$";
                    // currentBackupData.usd_clp_rate = parseFloat(currentBackupData.usd_clp_rate) || null; // No longer stored

                    // Convert dates within incomes and expenses
                    (currentBackupData.incomes || []).forEach(inc => {
                        if (inc.start_date) inc.start_date = new Date(inc.start_date + 'T00:00:00Z');
                        if (inc.end_date) inc.end_date = new Date(inc.end_date + 'T00:00:00Z');
                    });
                    (currentBackupData.expenses || []).forEach(exp => {
                        if (exp.start_date) exp.start_date = new Date(exp.start_date + 'T00:00:00Z');
                        if (exp.end_date) exp.end_date = new Date(exp.end_date + 'T00:00:00Z');
                    });

                    originalLoadedData = JSON.parse(JSON.stringify(currentBackupData)); // Deep copy for change tracking

                    // Populate UI elements
                    populateSettingsForm();
                    populateExpenseCategoriesDropdowns(); // This will also call populateIncomeReimbursementCategoriesDropdown
                    renderIncomesTable();
                    renderExpensesTable();
                    renderBudgetsTable();
                    renderBabySteps();
                    renderReminders();
                    renderLogTab(); // Render the change log
                    setupPaymentPeriodSelectors(); // Setup before rendering payments
                    renderPaymentsTableForCurrentPeriod();
                    renderCashflowTable(); // This will also trigger chart rendering

                    showMainContentScreen(); // This will also call fetchAndUpdateUSDCLPRate
                } else {
                    alert("La versión seleccionada no contiene datos válidos o está vacía.");
                    currentBackupData = null; // Reset state
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
                currentBackupData = null; // Reset state on error
                originalLoadedData = null;
                currentBackupKey = null;
                changeLogEntries = [];
            });
    }

    function formatBackupKey(key) {
        if (!key) return "N/A";
        const ts = key.replace("backup_", ""); // Remove prefix
        // Basic check for a plausible timestamp format (YYYYMMDDTHHMMSS)
        if (ts.length === 15 && ts.includes('T')) {
            const year = ts.substring(0, 4);
            const month = ts.substring(4, 6);
            const day = ts.substring(6, 8);
            const hour = ts.substring(9, 11);
            const minute = ts.substring(11, 13);
            const second = ts.substring(13, 15);
            return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
        }
        return key; // Return original key if format is unexpected
    }

    function generateDetailedChangeLog(prevData, currentData) {
        const details = [];
        const symbol = currentData.display_currency_symbol || '$';

        // If no previous data, it's a new creation or first load from default
        if (!prevData) {
            details.push("Versión inicial de datos cargada/creada.");
            (currentData.incomes || []).forEach(inc => details.push(`Ingreso agregado: ${inc.name} (${formatCurrencyJS(inc.net_monthly, symbol)})${inc.is_reimbursement ? ' (Reembolso)' : ''}`));
            (currentData.expenses || []).forEach(exp => details.push(`Gasto agregado: ${exp.name} (${formatCurrencyJS(exp.amount, symbol)}, Cat: ${exp.category})`));
            // Add more details for other sections if needed for an initial log
            return details;
        }

        // Compare settings
        if (prevData.analysis_periodicity !== currentData.analysis_periodicity) details.push(`Ajuste: Periodicidad cambiada de '${prevData.analysis_periodicity}' a '${currentData.analysis_periodicity}'.`);
        if (prevData.analysis_duration !== currentData.analysis_duration) details.push(`Ajuste: Duración cambiada de ${prevData.analysis_duration} a ${currentData.analysis_duration}.`);
        if (getISODateString(new Date(prevData.analysis_start_date)) !== getISODateString(new Date(currentData.analysis_start_date))) details.push(`Ajuste: Fecha de inicio cambiada de ${getISODateString(new Date(prevData.analysis_start_date))} a ${getISODateString(new Date(currentData.analysis_start_date))}.`);
        if (prevData.analysis_initial_balance !== currentData.analysis_initial_balance) details.push(`Ajuste: Saldo inicial cambiado de ${formatCurrencyJS(prevData.analysis_initial_balance, symbol)} a ${formatCurrencyJS(currentData.analysis_initial_balance, symbol)}.`);
        if (prevData.display_currency_symbol !== currentData.display_currency_symbol) details.push(`Ajuste: Símbolo de moneda cambiado de '${prevData.display_currency_symbol}' a '${currentData.display_currency_symbol}'.`);
        // usd_clp_rate is no longer stored, so no comparison needed here.

        // Compare Incomes
        const prevIncomes = prevData.incomes || [];
        const currentIncomes = currentData.incomes || [];
        currentIncomes.forEach(currentInc => {
            const prevInc = prevIncomes.find(pInc => pInc.name === currentInc.name); // Simple find by name
            if (!prevInc) {
                details.push(`Ingreso agregado: ${currentInc.name} (${formatCurrencyJS(currentInc.net_monthly, symbol)}, ${currentInc.frequency}, Inicio: ${getISODateString(new Date(currentInc.start_date))}${currentInc.end_date ? ', Fin: ' + getISODateString(new Date(currentInc.end_date)) : ''})${currentInc.is_reimbursement ? ` (Reembolso de ${currentInc.reimbursement_category || 'N/A'})` : ''}.`);
            } else { // Existing income, check for modifications
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
                if (prevInc.reimbursement_category !== currentInc.reimbursement_category) { // Will be null if not reimbursement
                    mods.push(`Categoría Reembolso: ${prevInc.reimbursement_category || 'N/A'} -> ${currentInc.reimbursement_category || 'N/A'}`);
                }
                if (mods.length > 0) details.push(`Ingreso modificado '${currentInc.name}': ${mods.join(', ')}.`);
            }
        });
        prevIncomes.forEach(prevInc => { // Check for deleted incomes
            if (!currentIncomes.find(cInc => cInc.name === prevInc.name)) {
                details.push(`Ingreso eliminado: ${prevInc.name} (${formatCurrencyJS(prevInc.net_monthly, symbol)}).`);
            }
        });

        // Compare Expenses (similar logic to incomes)
        const prevExpenses = prevData.expenses || [];
        const currentExpenses = currentData.expenses || [];
        currentExpenses.forEach(currentExp => {
            const prevExp = prevExpenses.find(pExp => pExp.name === currentExp.name);
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

        // Compare Expense Categories
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

        // Compare Budgets
        const prevBudgets = prevData.budgets || {};
        const currentBudgets = currentData.budgets || {};
        // Iterate over current categories to catch new/modified budgets
        Object.keys(currentCategories).forEach(catName => { // Use current categories as the source of truth for budget keys
            const prevAmount = prevBudgets[catName] !== undefined ? prevBudgets[catName] : 0; // Default to 0 if not in prev
            const currentAmount = currentBudgets[catName] !== undefined ? currentBudgets[catName] : 0; // Default to 0 if not in current (should exist if category exists)

            if (prevAmount !== currentAmount) {
                if (prevBudgets[catName] === undefined && currentAmount !== 0) { // New budget for existing category
                    details.push(`Presupuesto para '${catName}' establecido a: ${formatCurrencyJS(currentAmount, symbol)}.`);
                } else { // Modified budget
                    details.push(`Presupuesto para '${catName}' cambiado de ${formatCurrencyJS(prevAmount, symbol)} a ${formatCurrencyJS(currentAmount, symbol)}.`);
                }
            }
        });
        // Iterate over previous budgets to catch budgets for categories that were deleted
        Object.keys(prevBudgets).forEach(catName => {
            if (!currentCategories[catName] && prevBudgets[catName] !== 0) { // Category was deleted but had a budget
                details.push(`Presupuesto para categoría eliminada '${catName}' (era ${formatCurrencyJS(prevBudgets[catName], symbol)}) removido.`);
            }
        });


        // Compare Reminders
        const prevReminders = prevData.reminders_todos || [];
        const currentReminders = currentData.reminders_todos || [];
        currentReminders.forEach((currentRem, idx) => {
            // Find by text, assuming text is unique enough for this log. For more robust, use IDs.
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

        // Compare Baby Steps Status (simple check for any change)
        if (JSON.stringify(prevData.baby_steps_status) !== JSON.stringify(currentData.baby_steps_status)) {
            details.push("Estado de Baby Steps modificado.");
        }

        // Compare Payments (simple check for any change)
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

        // Validate data before saving (Firebase key safety)
        let dataIsValidForSaving = true;
        const validationIssues = [];

        // Validate income names and reimbursement categories
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
        // Validate expense names and categories
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
        // Validate expense category names (keys in expense_categories object)
        if (currentBackupData.expense_categories) {
            for (const categoryName in currentBackupData.expense_categories) {
                if (!isFirebaseKeySafe(categoryName)) {
                    validationIssues.push(`La categoría de gasto "${categoryName}" tiene un nombre con caracteres no permitidos.`);
                    dataIsValidForSaving = false;
                }
            }
        }
        // Validate budget category names (keys in budgets object)
        if (currentBackupData.budgets) {
            for (const categoryName in currentBackupData.budgets) {
                if (!isFirebaseKeySafe(categoryName)) {
                    validationIssues.push(`El presupuesto para la categoría "${categoryName}" tiene un nombre con caracteres no permitidos.`);
                    dataIsValidForSaving = false;
                }
            }
        }
        // If validation issues, alert user and return
        if (!dataIsValidForSaving) {
            alert("No se pueden guardar los cambios debido a los siguientes problemas:\n- " + validationIssues.join("\n- ") +
                `\n\nLos caracteres no permitidos son: ${FIREBASE_FORBIDDEN_CHARS_DISPLAY}. Por favor, corrige estos elementos.`);
            return;
        }

        // Deep copy current data for saving, ensuring no direct modification of currentBackupData
        const dataToSave = JSON.parse(JSON.stringify(currentBackupData));
        delete dataToSave.usd_clp_rate; // Ensure USD/CLP rate is not saved

        // Define default structure for new backups or if parts are missing
        const defaultsFromPython = { // Renamed to avoid confusion with Python, it's JS defaults
            version: "1.0_web_v3_usd_clp_auto", // Keep your versioning consistent
            analysis_start_date: getISODateString(new Date()),
            analysis_duration: 12,
            analysis_periodicity: "Mensual",
            analysis_initial_balance: 0,
            display_currency_symbol: "$",
            // usd_clp_rate: null, // Not stored
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
            change_log: [] // Initialize change_log
        };

        // Merge defaults for any top-level keys missing in dataToSave
        for (const key in defaultsFromPython) {
            if (dataToSave[key] === undefined || dataToSave[key] === null) {
                // Special handling for objects/arrays to avoid overwriting existing partial data
                if (key === 'expense_categories' && currentBackupData.expense_categories && Object.keys(currentBackupData.expense_categories).length > 0) {
                    // Don't overwrite if categories already exist
                } else if (key === 'budgets' && currentBackupData.budgets && Object.keys(currentBackupData.budgets).length > 0) {
                    // Don't overwrite if budgets already exist
                } else if (key === 'baby_steps_status' && currentBackupData.baby_steps_status && currentBackupData.baby_steps_status.length > 0) {
                    // Don't overwrite if baby_steps_status already exists
                }
                // Add other similar checks if needed for incomes, expenses, payments, reminders_todos
                else {
                    dataToSave[key] = defaultsFromPython[key];
                }
            }
        }
        // Ensure change_log is an array if it was missing
        if (!Array.isArray(dataToSave.change_log)) {
            dataToSave.change_log = [];
        }


        // Format dates to ISO strings for Firebase
        dataToSave.analysis_start_date = getISODateString(new Date(dataToSave.analysis_start_date));
        (dataToSave.incomes || []).forEach(inc => {
            if (inc.start_date) inc.start_date = getISODateString(new Date(inc.start_date));
            if (inc.end_date) inc.end_date = getISODateString(new Date(inc.end_date));
            // Ensure reimbursement fields are correctly set
            inc.is_reimbursement = typeof inc.is_reimbursement === 'boolean' ? inc.is_reimbursement : false;
            inc.reimbursement_category = inc.is_reimbursement ? (inc.reimbursement_category || null) : null;
        });
        (dataToSave.expenses || []).forEach(exp => {
            if (exp.start_date) exp.start_date = getISODateString(new Date(exp.start_date));
            if (exp.end_date) exp.end_date = getISODateString(new Date(exp.end_date));
            // Ensure expense type is set based on category
            if (exp.category && dataToSave.expense_categories && dataToSave.expense_categories[exp.category]) {
                exp.type = dataToSave.expense_categories[exp.category];
            } else {
                exp.type = "Variable"; // Default if category or type is missing
            }
            if (typeof exp.is_real === 'undefined') { // Default is_real if missing
                exp.is_real = false;
            }
        });

        // Payments are already in a good format (object with boolean values)
        // No specific formatting needed for payments beyond what's already handled.

        // Generate detailed log of changes
        const detailedChanges = generateDetailedChangeLog(originalLoadedData, currentBackupData);

        // Create new backup key
        const now = new Date();
        const newBackupKey = `backup_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}T${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

        let logMessageText = `Nueva versión ${formatBackupKey(newBackupKey)} guardada.`;
        if (currentBackupKey) {
            logMessageText += ` Basada en ${formatBackupKey(currentBackupKey)}.`;
        } else {
            logMessageText += ` Creada desde un estado inicial o datos por defecto.`;
        }

        const user = firebase.auth().currentUser;
        const userName = user && user.email ? mapEmailToName(user.email) : 'Usuario Desconocido';


        const logEntry = {
            timestamp: now.toISOString(),
            message: logMessageText,
            details: detailedChanges,
            newVersionKey: newBackupKey,
            previousVersionKey: currentBackupKey || null, // Store previous key for context
            user: userName // Store the user who made the change
        };

        // Prepend the new log entry to the existing log (which is already part of dataToSave.change_log)
        // Ensure dataToSave.change_log is an array
        if (!Array.isArray(dataToSave.change_log)) {
            dataToSave.change_log = [];
        }
        dataToSave.change_log.unshift(logEntry);


        loadingMessage.textContent = "Guardando cambios como nueva versión...";
        loadingMessage.style.display = 'block';

        if (!database) {
            console.error("Database service is not initialized. Cannot save changes.");
            loadingMessage.textContent = "Error: Servicio de base de datos no inicializado.";
            alert("Error crítico al guardar datos. Contactar soporte.");
            return;
        }

        database.ref('backups/' + newBackupKey).set(dataToSave)
            .then(() => {
                loadingMessage.style.display = 'none';
                alert(`Cambios guardados exitosamente como nueva versión: ${formatBackupKey(newBackupKey)}`);

                // Update current state to reflect the saved data
                currentBackupKey = newBackupKey; // Update current key
                currentBackupData = JSON.parse(JSON.stringify(dataToSave)); // Update current data

                // Convert dates back to Date objects for in-memory representation
                currentBackupData.analysis_start_date = new Date(currentBackupData.analysis_start_date + 'T00:00:00Z');
                (currentBackupData.incomes || []).forEach(inc => {
                    if (inc.start_date) inc.start_date = new Date(inc.start_date + 'T00:00:00Z');
                    if (inc.end_date) inc.end_date = new Date(inc.end_date + 'T00:00:00Z');
                });
                (currentBackupData.expenses || []).forEach(exp => {
                    if (exp.start_date) exp.start_date = new Date(exp.start_date + 'T00:00:00Z');
                    if (exp.end_date) exp.end_date = new Date(exp.end_date + 'T00:00:00Z');
                });
                originalLoadedData = JSON.parse(JSON.stringify(currentBackupData)); // Update original loaded data to new state

                changeLogEntries = currentBackupData.change_log; // Update in-memory log entries

                fetchBackups(); // Refresh backup list
                backupSelector.value = newBackupKey; // Select the newly saved version

                renderLogTab(); // Update the log tab display
            })
            .catch(error => {
                loadingMessage.style.display = 'none';
                console.error("Error saving new version:", error);
                alert(`Error al guardar la nueva versión: ${error.message}`);
                // Optionally, remove the logEntry if save failed, though it might be complex if dataToSave was already modified
                // For simplicity, the log in memory might be slightly ahead if save fails.
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

        // Specific rendering logic for certain tabs
        if (tabId === 'flujo-caja' || tabId === 'grafico') renderCashflowTable(); // Recalculates and renders chart
        if (tabId === 'presupuestos') { renderBudgetsTable(); renderBudgetSummaryTable(); }
        if (tabId === 'registro-pagos') { setupPaymentPeriodSelectors(); renderPaymentsTableForCurrentPeriod(); }
        if (tabId === 'ajustes') {
            populateSettingsForm();
            fetchAndUpdateUSDCLPRate(); // Fetch rate when adjustments tab is activated
        }
        if (tabId === 'log') renderLogTab();
    }
    tabsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('tab-button')) {
            activateTab(event.target.dataset.tab);
        }
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
            // Store the rate in a global variable or directly use it if needed elsewhere,
            // for now, just display it.
            // currentBackupData.usd_clp_rate = parseFloat(clpRate); // Example: if you decide to store it again
            usdClpInfoLabel.textContent = `1 USD = ${clpRate.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Fuente: CoinGecko)`;
        } catch (error) {
            console.warn("No se pudo actualizar el USD/CLP:", error);
            usdClpInfoLabel.innerHTML = `<b>1 USD = N/D</b> <small>(Error al obtener tasa)</small>`;
            // currentBackupData.usd_clp_rate = null; // Example: if you decide to store it again
        }
    }


    function populateSettingsForm() {
        if (!currentBackupData) return;
        analysisPeriodicitySelect.value = currentBackupData.analysis_periodicity || "Mensual";
        analysisDurationInput.value = currentBackupData.analysis_duration || 12;
        analysisStartDateInput.value = getISODateString(currentBackupData.analysis_start_date ? new Date(currentBackupData.analysis_start_date) : new Date());
        analysisInitialBalanceInput.value = currentBackupData.analysis_initial_balance || 0;
        displayCurrencySymbolInput.value = currentBackupData.display_currency_symbol || "$";
        // usdClpRateInput.value = currentBackupData.usd_clp_rate || ''; // Input field removed
        // updateUsdClpInfoLabel(); // Now handled by fetchAndUpdateUSDCLPRate when tab is active or content loads
        updateAnalysisDurationLabel(); // Update label based on periodicity
    }
    analysisPeriodicitySelect.addEventListener('change', updateAnalysisDurationLabel);
    function updateAnalysisDurationLabel() {
        analysisDurationLabel.textContent = analysisPeriodicitySelect.value === "Semanal" ? "Duración (Semanas):" : "Duración (Meses):";
    }
    // usdClpRateInput was removed, so its event listener and updateUsdClpInfoLabel are also removed.

    applySettingsButton.addEventListener('click', () => {
        if (!currentBackupData) { alert("No hay datos cargados para aplicar ajustes."); return; }
        const prevPeriodicity = currentBackupData.analysis_periodicity;
        const newPeriodicity = analysisPeriodicitySelect.value;

        currentBackupData.analysis_periodicity = newPeriodicity;
        currentBackupData.analysis_duration = parseInt(analysisDurationInput.value, 10);
        currentBackupData.analysis_start_date = new Date(analysisStartDateInput.value + 'T00:00:00Z'); // Ensure UTC context
        currentBackupData.analysis_initial_balance = parseFloat(analysisInitialBalanceInput.value);
        currentBackupData.display_currency_symbol = displayCurrencySymbolInput.value.trim() || "$";
        // currentBackupData.usd_clp_rate is no longer managed here, it's fetched on demand.

        // Adjust duration if periodicity changed and duration was at default
        if (prevPeriodicity !== newPeriodicity) {
            const prevDefaultDuration = (prevPeriodicity === "Mensual") ? 12 : 52; // Example defaults
            if (currentBackupData.analysis_duration === prevDefaultDuration) {
                currentBackupData.analysis_duration = (newPeriodicity === "Mensual") ? 12 : 52;
                analysisDurationInput.value = currentBackupData.analysis_duration;
            }
        }
        updateAnalysisDurationLabel(); // Reflect change in label
        alert("Ajustes aplicados. El flujo de caja y el gráfico se recalcularán.");
        renderCashflowTable(); // Recalculate and render
        setupPaymentPeriodSelectors(); // Re-setup selectors if periodicity/dates changed
        renderPaymentsTableForCurrentPeriod();
        renderBudgetsTable(); // Update budget views
        renderBudgetSummaryTable();
    });

    // --- LÓGICA PESTAÑA INGRESOS ---
    incomeOngoingCheckbox.addEventListener('change', () => {
        incomeEndDateInput.disabled = incomeOngoingCheckbox.checked;
        if (incomeOngoingCheckbox.checked) incomeEndDateInput.value = ''; // Clear end date if ongoing
    });
    incomeFrequencySelect.addEventListener('change', () => {
        const isUnico = incomeFrequencySelect.value === 'Único';
        incomeOngoingCheckbox.disabled = isUnico; // Disable ongoing if "Único"
        incomeEndDateInput.disabled = isUnico || incomeOngoingCheckbox.checked;
        if (isUnico) { incomeOngoingCheckbox.checked = false; incomeEndDateInput.value = ''; }
    });

    incomeIsReimbursementCheckbox.addEventListener('change', () => {
        incomeReimbursementCategoryContainer.style.display = incomeIsReimbursementCheckbox.checked ? 'block' : 'none';
        if (incomeIsReimbursementCheckbox.checked) {
            populateIncomeReimbursementCategoriesDropdown(); // Populate when shown
        } else {
            incomeReimbursementCategorySelect.value = ''; // Clear selection when hidden
        }
    });

    function populateIncomeReimbursementCategoriesDropdown() {
        if (!incomeReimbursementCategorySelect || !currentBackupData || !currentBackupData.expense_categories) {
            if (incomeReimbursementCategorySelect) incomeReimbursementCategorySelect.innerHTML = '<option value="">No hay categorías de gasto</option>';
            return;
        }
        const currentValue = incomeReimbursementCategorySelect.value; // Preserve current selection if possible
        incomeReimbursementCategorySelect.innerHTML = '<option value="">-- Selecciona Categoría de Gasto --</option>';
        const sortedCategories = Object.keys(currentBackupData.expense_categories).sort();
        sortedCategories.forEach(catName => {
            if (isFirebaseKeySafe(catName)) { // Only add safe keys
                const option = document.createElement('option');
                option.value = catName;
                option.textContent = catName;
                incomeReimbursementCategorySelect.appendChild(option);
            }
        });
        if (sortedCategories.includes(currentValue)) { // Restore selection if it's still valid
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
        if (isReimbursement && reimbursementCategory && !isFirebaseKeySafe(reimbursementCategory)) { alert(`La categoría de reembolso "${reimbursementCategory}" contiene caracteres no permitidos.`); return; }


        const startDate = startDateValue ? new Date(startDateValue + 'T00:00:00Z') : null; // UTC context
        const isOngoing = incomeOngoingCheckbox.checked;
        const endDate = (frequency === 'Único' || isOngoing || !endDateValue) ? null : new Date(endDateValue + 'T00:00:00Z'); // UTC

        if (isNaN(amount) || !startDate) { alert("Por favor, completa los campos obligatorios (Nombre, Monto, Fecha Inicio)."); return; }
        if (endDate && startDate && endDate < startDate) { alert("La fecha de fin no puede ser anterior a la fecha de inicio."); return; }

        const incomeEntry = {
            name,
            net_monthly: amount, // Assuming this is the periodic amount, not necessarily monthly if frequency differs
            frequency,
            start_date: startDate,
            end_date: endDate,
            is_reimbursement: isReimbursement,
            reimbursement_category: reimbursementCategory
        };

        if (editingIncomeIndex !== null) { // Editing existing
            currentBackupData.incomes[editingIncomeIndex] = incomeEntry;
        } else { // Adding new
            if (!currentBackupData.incomes) currentBackupData.incomes = [];
            currentBackupData.incomes.push(incomeEntry);
        }
        renderIncomesTable(); renderCashflowTable(); resetIncomeForm();
    });

    function resetIncomeForm() {
        incomeForm.reset();
        incomeOngoingCheckbox.checked = true; // Default state
        incomeEndDateInput.disabled = true; incomeEndDateInput.value = '';
        incomeFrequencySelect.value = 'Mensual'; // Default frequency

        incomeIsReimbursementCheckbox.checked = false; // Default state
        incomeReimbursementCategoryContainer.style.display = 'none';
        incomeReimbursementCategorySelect.value = '';

        addIncomeButton.textContent = 'Agregar Ingreso';
        cancelEditIncomeButton.style.display = 'none';
        editingIncomeIndex = null;
        // Set default start date to analysis start date or today
        incomeStartDateInput.value = getISODateString(currentBackupData && currentBackupData.analysis_start_date ? new Date(currentBackupData.analysis_start_date) : new Date());
    }
    cancelEditIncomeButton.addEventListener('click', resetIncomeForm);

    function renderIncomesTable() {
        if (!incomesTableView || !currentBackupData || !currentBackupData.incomes) return;
        incomesTableView.innerHTML = ''; // Clear existing rows
        const searchTerm = searchIncomeInput.value.toLowerCase();
        const filteredIncomes = currentBackupData.incomes.filter(income =>
            income.name.toLowerCase().includes(searchTerm) ||
            formatCurrencyJS(income.net_monthly, currentBackupData.display_currency_symbol || '$').toLowerCase().includes(searchTerm) ||
            income.frequency.toLowerCase().includes(searchTerm) ||
            (income.is_reimbursement && "reembolso".includes(searchTerm)) // Search for "reembolso"
        );
        filteredIncomes.forEach((income) => { // Iterate over potentially filtered list
            const originalIndex = currentBackupData.incomes.findIndex(inc => inc === income); // Find original index for editing/deleting
            const row = incomesTableView.insertRow();
            row.insertCell().textContent = income.name;
            row.insertCell().textContent = formatCurrencyJS(income.net_monthly, currentBackupData.display_currency_symbol || '$');
            row.insertCell().textContent = income.frequency;
            row.insertCell().textContent = income.start_date ? getISODateString(new Date(income.start_date)) : 'N/A';
            row.insertCell().textContent = income.end_date ? getISODateString(new Date(income.end_date)) : (income.frequency === 'Único' ? 'N/A (Único)' : 'Recurrente');

            const typeCell = row.insertCell();
            if (income.is_reimbursement) {
                typeCell.innerHTML = `Reembolso <span class="reimbursement-icon" title="Reembolso de ${income.reimbursement_category || 'N/A'}">↺</span>`;
                typeCell.classList.add('reimbursement-income'); // Apply special style
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
    searchIncomeInput.addEventListener('input', renderIncomesTable); // Re-render on search

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
            incomeOngoingCheckbox.checked = !income.end_date; // Checked if no end date (ongoing)
            incomeEndDateInput.value = income.end_date ? getISODateString(new Date(income.end_date)) : '';
            incomeEndDateInput.disabled = incomeOngoingCheckbox.checked;
        }

        incomeIsReimbursementCheckbox.checked = income.is_reimbursement || false;
        if (incomeIsReimbursementCheckbox.checked) {
            populateIncomeReimbursementCategoriesDropdown(); // Ensure categories are loaded
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
            renderIncomesTable(); renderCashflowTable(); // Update views
            if (editingIncomeIndex === index) resetIncomeForm(); // Reset form if deleted item was being edited
            else if (editingIncomeIndex !== null && editingIncomeIndex > index) editingIncomeIndex--; // Adjust edit index
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
        const selects = [expenseCategorySelect, budgetCategorySelect]; // Both dropdowns use the same categories
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
            else if (sortedCategories.length > 0 && select.id === 'expense-category') {
                // Default to first category for expense form if current value is not valid
                // select.value = sortedCategories[0];
            }
        });
        updateRemoveCategoryButtonState(); // Update button based on selection/usage
        populateIncomeReimbursementCategoriesDropdown(); // Also update reimbursement dropdown as it depends on expense categories
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
                if (!currentBackupData.budgets) currentBackupData.budgets = {}; // Ensure budgets object exists
                currentBackupData.budgets[trimmedName] = 0; // Initialize budget for new category
                populateExpenseCategoriesDropdowns(); renderBudgetsTable(); // Update UI
                alert(`Categoría "${trimmedName}" (${currentBackupData.expense_categories[trimmedName]}) agregada.`);
            } else if (categoryType !== null) alert("Tipo de categoría inválido. Debe ser 'Fijo' o 'Variable'.");
        }
    });
    removeCategoryButton.addEventListener('click', () => {
        const categoryToRemove = expenseCategorySelect.value;
        if (!categoryToRemove) { alert("Selecciona una categoría para eliminar."); return; }
        // Check if category is in use by expenses or reimbursements
        const isInUseByExpense = (currentBackupData.expenses || []).some(exp => exp.category === categoryToRemove);
        const isInUseByReimbursement = (currentBackupData.incomes || []).some(inc => inc.is_reimbursement && inc.reimbursement_category === categoryToRemove);
        if (isInUseByExpense) { alert(`Categoría "${categoryToRemove}" está en uso por al menos un gasto y no se puede eliminar.`); return; }
        if (isInUseByReimbursement) { alert(`Categoría "${categoryToRemove}" está en uso por al menos un reembolso y no se puede eliminar.`); return; }

        if (confirm(`¿Eliminar categoría "${categoryToRemove}" y su presupuesto asociado?`)) {
            delete currentBackupData.expense_categories[categoryToRemove];
            if (currentBackupData.budgets) delete currentBackupData.budgets[categoryToRemove];
            populateExpenseCategoriesDropdowns(); renderBudgetsTable(); // Update UI
            alert(`Categoría "${categoryToRemove}" eliminada.`);
        }
    });
    expenseCategorySelect.addEventListener('change', updateRemoveCategoryButtonState); // Update on change
    function updateRemoveCategoryButtonState() {
        const selectedCategory = expenseCategorySelect.value;
        if (selectedCategory && currentBackupData && currentBackupData.expense_categories && currentBackupData.expense_categories[selectedCategory]) {
            const isInUseByExpense = (currentBackupData.expenses || []).some(exp => exp.category === selectedCategory);
            const isInUseByReimbursement = (currentBackupData.incomes || []).some(inc => inc.is_reimbursement && inc.reimbursement_category === selectedCategory);
            const isInUse = isInUseByExpense || isInUseByReimbursement;

            removeCategoryButton.disabled = isInUse;
            removeCategoryButton.title = isInUse ? `Categoría en uso (por gasto o reembolso)` : `Eliminar categoría '${selectedCategory}'`;
        } else {
            removeCategoryButton.disabled = true; // Disable if no valid category selected
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

        const expenseType = currentBackupData.expense_categories[category] || "Variable"; // Get type from categories map
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
        // Set category to first available if none selected, or leave as is
        if (expenseCategorySelect.options.length > 0 && expenseCategorySelect.value === "") {
            if (expenseCategorySelect.options[0].value !== "") expenseCategorySelect.selectedIndex = 0; // If first is not placeholder
            else if (expenseCategorySelect.options.length > 1) expenseCategorySelect.selectedIndex = 1; // If first is placeholder, select next
        }
        addExpenseButton.textContent = 'Agregar Gasto'; cancelEditExpenseButton.style.display = 'none';
        editingExpenseIndex = null;
        expenseStartDateInput.value = getISODateString(currentBackupData && currentBackupData.analysis_start_date ? new Date(currentBackupData.analysis_start_date) : new Date());
        updateRemoveCategoryButtonState(); // Update button state after reset
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
        updateRemoveCategoryButtonState(); // Update button state based on loaded expense's category
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
        if (budgetCategorySelect.options.length > 0) budgetCategorySelect.selectedIndex = 0; // Default to first option (placeholder or first category)
        budgetAmountInput.value = ''; // Clear amount
    }
    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = budgetCategorySelect.value;
        const amount = parseFloat(budgetAmountInput.value);
        if (!category) { alert("Selecciona una categoría."); return; }
        if (isNaN(amount) || amount < 0) { alert("Ingresa un monto válido para el presupuesto."); return; }
        if (!isFirebaseKeySafe(category)) { alert(`Categoría "${category}" con nombre no permitido.`); return; }

        if (!currentBackupData.budgets) currentBackupData.budgets = {}; // Initialize if not exists
        currentBackupData.budgets[category] = amount;
        renderBudgetsTable(); renderBudgetSummaryTable(); renderCashflowTable(); // Update relevant views
        alert(`Presupuesto para "${category}" guardado como ${formatCurrencyJS(amount, currentBackupData.display_currency_symbol || '$')}.`);
    });
    budgetCategorySelect.addEventListener('change', () => { // When category changes, populate amount input
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
            // Make row clickable to populate the form for editing
            row.addEventListener('click', () => {
                budgetCategorySelect.value = catName;
                budgetAmountInput.value = budgetAmount; // Or use .toString() if needed
                document.getElementById('presupuestos').scrollIntoView({ behavior: 'smooth' }); // Scroll to form
            });
        });
    }
    function renderBudgetSummaryTable() {
        if (!budgetSummaryTableBody || !currentBackupData) return;
        budgetSummaryTableBody.innerHTML = '';
        if (!currentBackupData.analysis_start_date || !currentBackupData.expenses || !currentBackupData.budgets || !currentBackupData.expense_categories) {
            const row = budgetSummaryTableBody.insertRow();
            const cell = row.insertCell(); cell.colSpan = 5; cell.textContent = "Datos insuficientes para el resumen."; cell.style.textAlign = "center";
            return;
        }

        const analysisStartDate = new Date(currentBackupData.analysis_start_date);
        const currentMonth = analysisStartDate.getUTCMonth(); // Use month of analysis start date for summary
        const currentYear = analysisStartDate.getUTCFullYear();
        const expensesThisMonth = {}; // Accumulate expenses for the summary month

        // Calculate expenses for the specific month of analysisStartDate
        (currentBackupData.expenses || []).forEach(exp => {
            if (!exp.start_date) return;
            const expStartDate = new Date(exp.start_date);
            let amountForSummary = 0;

            // Logic to determine if expense occurs in the summary month
            if (exp.frequency === "Único") {
                if (expStartDate.getUTCFullYear() === currentYear && expStartDate.getUTCMonth() === currentMonth) {
                    amountForSummary = exp.amount;
                }
            } else if (exp.frequency === "Mensual") {
                // Check if active in the summary month
                if (expStartDate <= new Date(Date.UTC(currentYear, currentMonth + 1, 0)) && // Starts before or during summary month end
                    (!exp.end_date || new Date(exp.end_date) >= new Date(Date.UTC(currentYear, currentMonth, 1)))) { // Ends after or during summary month start (or no end date)
                    amountForSummary = exp.amount;
                }
            } else if (exp.frequency === "Semanal") {
                if (expStartDate <= new Date(Date.UTC(currentYear, currentMonth + 1, 0)) &&
                    (!exp.end_date || new Date(exp.end_date) >= new Date(Date.UTC(currentYear, currentMonth, 1)))) {
                    // Approximate weekly to monthly for summary: (amount * 52 weeks) / 12 months
                    amountForSummary = exp.amount * (52 / 12);
                }
            } else if (exp.frequency === "Bi-semanal") {
                // More complex: count occurrences in the summary month
                let occurrences = 0;
                let checkDate = new Date(expStartDate.getTime());
                const monthStartDate = new Date(Date.UTC(currentYear, currentMonth, 1));
                const monthEndDate = new Date(Date.UTC(currentYear, currentMonth + 1, 0));

                while (checkDate <= monthEndDate && (!exp.end_date || checkDate <= new Date(exp.end_date))) {
                    if (checkDate >= monthStartDate) {
                        occurrences++;
                    }
                    checkDate = addWeeks(checkDate, 2); // Move to next bi-weekly occurrence
                }
                amountForSummary = exp.amount * occurrences;
            }
            if (amountForSummary > 0) {
                expensesThisMonth[exp.category] = (expensesThisMonth[exp.category] || 0) + amountForSummary;
            }
        });

        // Apply reimbursements for the summary month
        (currentBackupData.incomes || []).forEach(reimbInc => {
            if (!reimbInc.is_reimbursement || !reimbInc.reimbursement_category || !reimbInc.start_date) return;
            const reimbStartDate = new Date(reimbInc.start_date);
            let amountToReimburseThisMonth = 0;

            if (reimbInc.frequency === "Único") {
                if (reimbStartDate.getUTCFullYear() === currentYear && reimbStartDate.getUTCMonth() === currentMonth) {
                    amountToReimburseThisMonth = reimbInc.net_monthly;
                }
            } else if (reimbInc.frequency === "Mensual") {
                if (reimbStartDate <= new Date(Date.UTC(currentYear, currentMonth + 1, 0)) &&
                    (!reimbInc.end_date || new Date(reimbInc.end_date) >= new Date(Date.UTC(currentYear, currentMonth, 1)))) {
                    amountToReimburseThisMonth = reimbInc.net_monthly;
                }
            } else if (reimbInc.frequency === "Semanal") {
                 if (reimbStartDate <= new Date(Date.UTC(currentYear, currentMonth + 1, 0)) &&
                    (!reimbInc.end_date || new Date(reimbInc.end_date) >= new Date(Date.UTC(currentYear, currentMonth, 1)))) {
                    amountToReimburseThisMonth = reimbInc.net_monthly * (52/12);
                 }
            } else if (reimbInc.frequency === "Bi-semanal") {
                let occurrences = 0; let checkDate = new Date(reimbStartDate.getTime());
                const monthStartDate = new Date(Date.UTC(currentYear, currentMonth, 1));
                const monthEndDate = new Date(Date.UTC(currentYear, currentMonth + 1, 0));
                while (checkDate <= monthEndDate && (!reimbInc.end_date || checkDate <= new Date(reimbInc.end_date))) {
                    if (checkDate >= monthStartDate) occurrences++;
                    checkDate = addWeeks(checkDate, 2);
                }
                amountToReimburseThisMonth = reimbInc.net_monthly * occurrences;
            }

            if (amountToReimburseThisMonth > 0 && expensesThisMonth[reimbInc.reimbursement_category]) {
                expensesThisMonth[reimbInc.reimbursement_category] = Math.max(0, expensesThisMonth[reimbInc.reimbursement_category] - amountToReimburseThisMonth);
            }
        });


        const sortedCategories = Object.keys(currentBackupData.expense_categories).sort();
        sortedCategories.forEach(catName => {
            const budget = currentBackupData.budgets[catName] || 0;
            const spent = expensesThisMonth[catName] || 0;
            const difference = budget - spent;
            const percentageSpent = budget > 0 ? (spent / budget * 100) : (spent > 0 ? Infinity : 0); // Handle budget = 0

            const row = budgetSummaryTableBody.insertRow();
            row.insertCell().textContent = catName;
            row.insertCell().textContent = formatCurrencyJS(budget, currentBackupData.display_currency_symbol);
            row.insertCell().textContent = formatCurrencyJS(spent, currentBackupData.display_currency_symbol);

            const diffCell = row.insertCell(); diffCell.textContent = formatCurrencyJS(difference, currentBackupData.display_currency_symbol);
            diffCell.classList.remove('text-red', 'text-green'); // Clear previous classes
            if (difference < 0) diffCell.classList.add('text-red');
            else if (difference >= 0 && budget > 0) diffCell.classList.add('text-green'); // Green if non-negative and budget exists

            const percCell = row.insertCell(); percCell.textContent = percentageSpent === Infinity ? "N/A (Sin Presupuesto)" : `${percentageSpent.toFixed(1)}%`;
            percCell.classList.remove('text-red', 'text-orange', 'text-green'); // Clear previous classes
            if (budget > 0) {
                if (percentageSpent > 100) percCell.classList.add('text-red');
                else if (percentageSpent >= 80) percCell.classList.add('text-orange');
                else percCell.classList.add('text-green');
            } else if (spent > 0) { // Spent money without a budget
                percCell.classList.add('text-red');
            }
        });
    }

    // --- LÓGICA PESTAÑA REGISTRO PAGOS ---
    function setupPaymentPeriodSelectors() {
        currentPaymentViewDate = (currentBackupData && currentBackupData.analysis_start_date) ? new Date(currentBackupData.analysis_start_date) : new Date();
        const analysisStartDate = new Date(currentPaymentViewDate);
        // Determine end of analysis to limit year selection reasonably
        const analysisDuration = (currentBackupData ? currentBackupData.analysis_duration : 12);
        const analysisPeriodicity = (currentBackupData ? currentBackupData.analysis_periodicity : "Mensual");
        let analysisEndDate;
        if (analysisPeriodicity === "Semanal") {
            analysisEndDate = addWeeks(new Date(analysisStartDate), analysisDuration);
        } else {
            analysisEndDate = addMonths(new Date(analysisStartDate), analysisDuration);
        }

        paymentYearSelect.innerHTML = '';
        const startYear = Math.min(analysisStartDate.getUTCFullYear(), new Date().getUTCFullYear()) - 2; // Go back 2 years from earliest date
        const endYear = Math.max(analysisEndDate.getUTCFullYear(), new Date().getUTCFullYear()) + 5;   // Go forward 5 years from latest date
        for (let y = startYear; y <= endYear; y++) { const option = document.createElement('option'); option.value = y; option.textContent = y; paymentYearSelect.appendChild(option); }
        paymentYearSelect.value = currentPaymentViewDate.getUTCFullYear();

        paymentMonthSelect.innerHTML = '';
        MONTH_NAMES_FULL_ES.forEach((monthName, index) => { const option = document.createElement('option'); option.value = index; option.textContent = monthName; paymentMonthSelect.appendChild(option); });
        paymentMonthSelect.value = currentPaymentViewDate.getUTCMonth();

        paymentWeekSelect.innerHTML = '';
        for (let w = 1; w <= 53; w++) { const option = document.createElement('option'); option.value = w; option.textContent = `Semana ${w}`; paymentWeekSelect.appendChild(option); }
        const [, currentIsoWeek] = getWeekNumber(currentPaymentViewDate); paymentWeekSelect.value = currentIsoWeek;

        updatePaymentPeriodSelectorVisibility();
        // Remove old listeners before adding new ones to prevent multiple triggers
        [paymentYearSelect, paymentMonthSelect, paymentWeekSelect].forEach(sel => {
            sel.removeEventListener('change', renderPaymentsTableForCurrentPeriod); // Clean up
            sel.addEventListener('change', renderPaymentsTableForCurrentPeriod);
        });
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
            // Create a date within the current week to navigate from
            const currentWeekDate = getMondayOfWeek(year, week);
            const newDate = addWeeks(currentWeekDate, direction); // Add or subtract a week
            const [newYear, newWeekNumber] = getWeekNumber(newDate);
            paymentYearSelect.value = newYear; paymentWeekSelect.value = newWeekNumber;
        } else {
            let month = parseInt(paymentMonthSelect.value);
            const newMonthDate = new Date(Date.UTC(year, month, 15)); // Use mid-month to avoid day overflow issues
            newMonthDate.setUTCMonth(newMonthDate.getUTCMonth() + direction);
            paymentYearSelect.value = newMonthDate.getUTCFullYear(); paymentMonthSelect.value = newMonthDate.getUTCMonth();
        }
        renderPaymentsTableForCurrentPeriod();
    }
    function renderPaymentsTableForCurrentPeriod() {
        if (!paymentsTableView || !currentBackupData || !currentBackupData.expenses) {
            if (paymentsTableView) paymentsTableView.innerHTML = '<tr><td colspan="6">No hay datos de gastos para mostrar.</td></tr>';
            return;
        }
        updatePaymentPeriodSelectorVisibility(); // Ensure correct selectors are visible

        const isWeeklyView = currentBackupData.analysis_periodicity === "Semanal";
        const year = parseInt(paymentYearSelect.value);
        let periodStart, periodEnd, paymentLogPeriodKeyPart;

        if (isWeeklyView) {
            const week = parseInt(paymentWeekSelect.value);
            periodStart = getMondayOfWeek(year, week);
            periodEnd = addWeeks(new Date(periodStart), 1); // End of week is start of next week
            periodEnd.setUTCDate(periodEnd.getUTCDate() - 1); // Go back one day to get last day of current week
            paymentLogPeriodKeyPart = `W${week}`; // Use W prefix for week keys
        } else {
            const monthIndex = parseInt(paymentMonthSelect.value);
            periodStart = new Date(Date.UTC(year, monthIndex, 1));
            periodEnd = new Date(Date.UTC(year, monthIndex + 1, 0)); // Last day of the month
            paymentLogPeriodKeyPart = `M${monthIndex + 1}`; // Use M prefix for month keys
        }
        currentPaymentViewDate = periodStart; // Update global view date

        paymentsTableView.innerHTML = ''; let expensesInPeriodFound = false;

        currentBackupData.expenses.forEach(expense => {
            if (!expense.start_date) return;
            const expStartDate = new Date(expense.start_date);
            const expEndDate = expense.end_date ? new Date(expense.end_date) : null;
            let occursInPeriod = false;
            let effectiveAmount = expense.amount; // Base amount

            if (expense.frequency === "Único") {
                if (expStartDate >= periodStart && expStartDate <= periodEnd) {
                    occursInPeriod = true;
                }
            } else if (expense.frequency === "Mensual") {
                if (isWeeklyView) { // If viewing weekly, check if monthly payment day falls in this week
                    const payDay = expStartDate.getUTCDate(); // Day of the month payment occurs
                    // Check if a date with 'payDay' in the periodStart's month/year falls within the week
                    let dateInPeriodMonth = new Date(Date.UTC(periodStart.getUTCFullYear(), periodStart.getUTCMonth(), payDay));
                    if (dateInPeriodMonth >= periodStart && dateInPeriodMonth <= periodEnd && dateInPeriodMonth >= expStartDate && (!expEndDate || dateInPeriodMonth <= expEndDate)) {
                        occursInPeriod = true;
                    }
                } else { // Monthly view
                    if (expStartDate <= periodEnd && (!expEndDate || expEndDate >= periodStart)) {
                        occursInPeriod = true;
                    }
                }
            } else if (expense.frequency === "Semanal") {
                // For weekly expenses, they always occur if the period overlaps and is weekly, or convert for monthly
                if (expStartDate <= periodEnd && (!expEndDate || expEndDate >= periodStart)) {
                    occursInPeriod = true;
                    if (!isWeeklyView) { // If monthly view, approximate
                        // effectiveAmount = expense.amount * (52 / 12); // This might be better for cashflow, not for payment log
                    }
                }
            } else if (expense.frequency === "Bi-semanal") {
                // Check if any bi-weekly occurrence falls within the period
                let paymentDate = new Date(expStartDate.getTime());
                while (paymentDate <= periodEnd && (!expEndDate || paymentDate <= expEndDate)) {
                    if (paymentDate >= periodStart) {
                        occursInPeriod = true;
                        break;
                    }
                    paymentDate = addWeeks(paymentDate, 2);
                }
                if (!isWeeklyView && occursInPeriod) {
                    // For monthly view, count how many bi-weekly payments in this month
                    // This is complex for a simple payment log, might just show base amount if it occurs
                }
            }

            if (occursInPeriod) {
                expensesInPeriodFound = true; const row = paymentsTableView.insertRow();
                row.insertCell().textContent = expense.name;
                row.insertCell().textContent = formatCurrencyJS(effectiveAmount, currentBackupData.display_currency_symbol); // Show base amount for log
                row.insertCell().textContent = expense.category;
                row.insertCell().textContent = currentBackupData.expense_categories[expense.category] || 'Variable';
                row.insertCell().textContent = expense.is_real ? 'Sí' : 'No';

                const paidCell = row.insertCell(); const checkbox = document.createElement('input'); checkbox.type = 'checkbox';
                // Create a more specific payment key including the period start date to differentiate occurrences
                const paymentKey = `${expense.name}|${getISODateString(periodStart)}`;
                checkbox.checked = currentBackupData.payments && currentBackupData.payments[paymentKey] === true;
                checkbox.dataset.paymentKey = paymentKey;
                checkbox.addEventListener('change', (e) => {
                    if (!currentBackupData.payments) currentBackupData.payments = {};
                    currentBackupData.payments[e.target.dataset.paymentKey] = e.target.checked;
                    // Potentially re-render cashflow or budget summary if payments affect 'actuals'
                });
                paidCell.appendChild(checkbox);
            }
        });
        if (!expensesInPeriodFound) {
            const row = paymentsTableView.insertRow(); const cell = row.insertCell(); cell.colSpan = 6;
            cell.textContent = "No hay gastos programados para este período."; cell.style.textAlign = "center";
        }
    }

    // --- LÓGICA PESTAÑA FLUJO DE CAJA ---
    function renderCashflowTable() {
        if (!currentBackupData || !cashflowTableBody || !cashflowTableHead) return;
        cashflowTableHead.innerHTML = ''; cashflowTableBody.innerHTML = '';

        let analysisStartDateObj = currentBackupData.analysis_start_date;
        if (typeof analysisStartDateObj === 'string') { // Ensure it's a Date object
            analysisStartDateObj = new Date(analysisStartDateObj + 'T00:00:00Z');
        }
        if (!(analysisStartDateObj instanceof Date) || isNaN(analysisStartDateObj.getTime())) {
            cashflowTableBody.innerHTML = '<tr><td colspan="2">Error: Fecha de inicio del análisis inválida.</td></tr>';
            return;
        }

        // Create a deep copy of data for calculation to avoid modifying original Date objects
        const tempCalcData = {
            ...currentBackupData,
            analysis_start_date: new Date(analysisStartDateObj.getTime()), // Copy date
            incomes: (currentBackupData.incomes || []).map(inc => ({
                ...inc,
                start_date: inc.start_date ? new Date(new Date(inc.start_date).getTime()) : null,
                end_date: inc.end_date ? new Date(new Date(inc.end_date).getTime()) : null
            })),
            expenses: (currentBackupData.expenses || []).map(exp => ({
                ...exp,
                start_date: exp.start_date ? new Date(new Date(exp.start_date).getTime()) : null,
                end_date: exp.end_date ? new Date(new Date(exp.end_date).getTime()) : null
            })),
        };

        const { periodDates, income_p, fixed_exp_p, var_exp_p, net_flow_p, end_bal_p, expenses_by_cat_p } = calculateCashFlowData(tempCalcData);

        if (!periodDates || periodDates.length === 0) {
            cashflowTableBody.innerHTML = '<tr><td colspan="2">No hay datos para el período seleccionado.</td></tr>';
            if (cashflowChartInstance) cashflowChartInstance.destroy(); cashflowChartInstance = null;
            if (chartMessage) chartMessage.textContent = "No hay datos para graficar.";
            return;
        }

        const symbol = currentBackupData.display_currency_symbol || "$";
        const periodicity = currentBackupData.analysis_periodicity;
        const initialBalance = parseFloat(currentBackupData.analysis_initial_balance);

        const startQDate = analysisStartDateObj; // Use the original (or correctly parsed) start date for title
        const startStr = `${('0' + startQDate.getUTCDate()).slice(-2)}/${('0' + (startQDate.getUTCMonth() + 1)).slice(-2)}/${startQDate.getUTCFullYear()}`;
        const durationUnit = periodicity === "Semanal" ? "Semanas" : "Meses";
        cashflowTitle.textContent = `Proyección Flujo de Caja (${currentBackupData.analysis_duration} ${durationUnit} desde ${startStr})`;

        // Build Header Row
        const headerRow = cashflowTableHead.insertRow();
        const thConcept = document.createElement('th'); thConcept.textContent = 'Categoría / Concepto'; headerRow.appendChild(thConcept);
        periodDates.forEach(d => {
            const th = document.createElement('th');
            if (periodicity === "Semanal") {
                const [year, week] = getWeekNumber(d);
                const mondayOfWeek = getMondayOfWeek(year, week); // Get Monday of that week
                th.innerHTML = `Sem ${week} (${DATE_WEEK_START_FORMAT(mondayOfWeek)})<br>${year}`;
            } else { // Mensual
                th.innerHTML = `${MONTH_NAMES_ES[d.getUTCMonth()]}<br>${d.getUTCFullYear()}`;
            }
            headerRow.appendChild(th);
        });

        // Define rows for cashflow table
        const cf_row_definitions = [
            { key: 'START_BALANCE', label: "Saldo Inicial", isBold: true, isHeaderBg: true },
            { key: 'NET_INCOME', label: "Ingreso Total Neto", isBold: true },
            // Dynamic expense categories will be inserted here
            { key: 'FIXED_EXP_TOTAL', label: "Total Gastos Fijos", isBold: true, isHeaderBg: true },
            // Dynamic variable expense categories here
            { key: 'VAR_EXP_TOTAL', label: "Total Gastos Variables", isBold: true, isHeaderBg: true },
            { key: 'NET_FLOW', label: "Flujo Neto del Período", isBold: true },
            { key: 'END_BALANCE', label: "Saldo Final Estimado", isBold: true, isHeaderBg: true }
        ];

        // Insert fixed expense categories
        const fixedCategories = currentBackupData.expense_categories ? Object.keys(currentBackupData.expense_categories).filter(cat => currentBackupData.expense_categories[cat] === "Fijo").sort() : [];
        fixedCategories.forEach((cat, index) => {
            cf_row_definitions.splice(2 + index, 0, { key: `CAT_${cat}`, label: cat, isIndent: true, category: cat });
        });

        // Insert variable expense categories
        const variableCategories = currentBackupData.expense_categories ? Object.keys(currentBackupData.expense_categories).filter(cat => currentBackupData.expense_categories[cat] === "Variable").sort() : [];
        const fixedExpTotalIndex = cf_row_definitions.findIndex(def => def.key === 'FIXED_EXP_TOTAL');
        variableCategories.forEach((cat, index) => {
            cf_row_definitions.splice(fixedExpTotalIndex + 1 + index, 0, { key: `CAT_${cat}`, label: cat, isIndent: true, category: cat });
        });


        // Build Body Rows
        cf_row_definitions.forEach((def, rowIndex) => {
            const tr = cashflowTableBody.insertRow();
            const tdLabel = tr.insertCell();
            tdLabel.textContent = def.isIndent ? `  ${def.label}` : def.label; // Indent category names
            if (def.isBold) tdLabel.classList.add('bold');
            if (def.isHeaderBg) tr.classList.add('bg-header');
            else if (rowIndex % 2 !== 0 && !def.isHeaderBg) tr.classList.add('bg-alt-row'); // Alt row styling

            for (let i = 0; i < periodDates.length; i++) {
                const tdValue = tr.insertCell();
                let value;
                let colorClass = '';
                switch (def.key) {
                    case 'START_BALANCE':
                        value = (i === 0) ? initialBalance : end_bal_p[i - 1];
                        break;
                    case 'NET_INCOME':
                        value = income_p[i];
                        break;
                    case 'FIXED_EXP_TOTAL':
                        value = -fixed_exp_p[i]; // Show as negative
                        break;
                    case 'VAR_EXP_TOTAL':
                        value = -var_exp_p[i]; // Show as negative
                        break;
                    case 'NET_FLOW':
                        value = net_flow_p[i];
                        colorClass = value >= 0 ? 'text-green' : 'text-red';
                        break;
                    case 'END_BALANCE':
                        value = end_bal_p[i];
                        colorClass = value >= 0 ? 'text-blue' : 'text-red';
                        break;
                    default: // Expense categories
                        value = (def.category && expenses_by_cat_p[i]) ? -(expenses_by_cat_p[i][def.category] || 0) : 0;
                }
                tdValue.textContent = formatCurrencyJS(value, symbol);
                if (colorClass) tdValue.classList.add(colorClass);
                if (def.isBold) tdValue.classList.add('bold');
            }
        });

        renderCashflowChart(periodDates, income_p, fixed_exp_p.map((val, idx) => val + var_exp_p[idx]), net_flow_p, end_bal_p);
        renderBudgetSummaryTable(); // Update budget summary as cashflow data might affect it
    }

    function calculateCashFlowData(data) {
        const startDate = data.analysis_start_date; // Already a Date object
        const duration = parseInt(data.analysis_duration, 10);
        const periodicity = data.analysis_periodicity;
        const initialBalance = parseFloat(data.analysis_initial_balance);

        let periodDates = [];
        let income_p = Array(duration).fill(0.0);
        let fixed_exp_p = Array(duration).fill(0.0);
        let var_exp_p = Array(duration).fill(0.0);
        let net_flow_p = Array(duration).fill(0.0);
        let end_bal_p = Array(duration).fill(0.0);
        let expenses_by_cat_p = Array(duration).fill(null).map(() => ({})); // expenses_by_cat_p[period_index][category_name]

        let currentDate = new Date(startDate.getTime()); // Start with a copy of the start date
        let currentBalance = initialBalance;

        const expenseCategoriesMap = data.expense_categories || {};
        const allCategories = Object.keys(expenseCategoriesMap);
        allCategories.forEach(cat => {
            for (let i = 0; i < duration; i++) {
                expenses_by_cat_p[i][cat] = 0.0; // Initialize all categories for each period
            }
        });


        for (let i = 0; i < duration; i++) {
            const p_start = new Date(currentDate.getTime()); // Start of the current period
            let p_end;

            if (periodicity === "Mensual") {
                p_end = addMonths(new Date(p_start.getTime()), 1);
                p_end.setUTCDate(p_end.getUTCDate() - 1); // Last day of the month
            } else { // Semanal
                p_end = addWeeks(new Date(p_start.getTime()), 1);
                p_end.setUTCDate(p_end.getUTCDate() - 1); // Last day of the week (Sunday)
            }
            periodDates.push(p_start);

            let p_inc_total_for_period = 0.0;

            // Calculate Incomes for the period
            (data.incomes || []).forEach(inc => {
                if (!inc.start_date) return; // Skip if no start date
                if (inc.is_reimbursement) return; // Exclude direct reimbursements from income total here; they reduce expenses

                const inc_start = inc.start_date; // Already a Date object
                const inc_end = inc.end_date;     // Already a Date object or null
                const net_amount = parseFloat(inc.net_monthly || 0);
                const inc_freq = inc.frequency || "Mensual";

                // Check if income is active in this period
                const isActiveRange = (inc_start <= p_end && (inc_end === null || inc_end >= p_start));
                if (!isActiveRange) return;

                let income_to_add_this_period = 0.0;
                if (inc_freq === "Mensual") {
                    if (periodicity === "Mensual") {
                        income_to_add_this_period = net_amount;
                    } else if (periodicity === "Semanal") {
                        // If monthly income and weekly view, check if payment day falls in this week
                        const payDay = inc_start.getUTCDate(); // Day of the month for payment
                        // Iterate through days of the current week to see if payDay matches
                        let tempDate = new Date(p_start.getTime());
                        while (tempDate <= p_end) {
                            if (tempDate.getUTCMonth() === inc_start.getUTCMonth() && tempDate.getUTCDate() === payDay) {
                                income_to_add_this_period = net_amount;
                                break;
                            }
                            // Check if the income's start_date itself falls within this week (for the first month of income)
                            if (tempDate.getUTCFullYear() === inc_start.getUTCFullYear() &&
                                tempDate.getUTCMonth() === inc_start.getUTCMonth() &&
                                tempDate.getUTCDate() === payDay) {
                                income_to_add_this_period = net_amount;
                                break;
                            }
                            tempDate.setUTCDate(tempDate.getUTCDate() + 1);
                        }
                    }
                } else if (inc_freq === "Único") {
                    if (p_start <= inc_start && inc_start <= p_end) { // Falls within the period
                        income_to_add_this_period = net_amount;
                    }
                } else if (inc_freq === "Semanal") {
                    if (periodicity === "Semanal") {
                        income_to_add_this_period = net_amount;
                    } else if (periodicity === "Mensual") {
                        // Approximate: number of weeks in the month * weekly amount
                        // This is a simplification. A more accurate way is to count actual weeks.
                        const daysInMonth = getDaysInMonth(p_start.getUTCFullYear(), p_start.getUTCMonth());
                        income_to_add_this_period = net_amount * (daysInMonth / 7);
                    }
                } else if (inc_freq === "Bi-semanal") {
                    let occurrences = 0;
                    let checkDate = new Date(inc_start.getTime());
                    while (checkDate <= p_end && (inc_end === null || checkDate <= inc_end)) {
                        if (checkDate >= p_start) {
                            occurrences++;
                        }
                        checkDate = addWeeks(checkDate, 2); // Move to next bi-weekly occurrence
                    }
                    income_to_add_this_period = net_amount * occurrences;
                }
                p_inc_total_for_period += income_to_add_this_period;
            });
            income_p[i] = p_inc_total_for_period;


            // Calculate Expenses for the period (before reimbursements)
            let p_temp_expenses_by_cat = {}; // Temporary for this period before reimbursements
            allCategories.forEach(cat => p_temp_expenses_by_cat[cat] = 0.0);

            (data.expenses || []).forEach(exp => {
                if (!exp.start_date) return;
                const e_start = exp.start_date; // Date object
                const e_end = exp.end_date;     // Date object or null
                const amt_raw = parseFloat(exp.amount || 0);
                const freq = exp.frequency || "Mensual";
                const cat = exp.category;

                if (amt_raw <= 0 || !cat || !allCategories.includes(cat)) return; // Skip invalid

                const isActiveRange = (e_start <= p_end && (e_end === null || e_end >= p_start));
                if (!isActiveRange) return;

                let exp_add_this_period = 0.0;
                if (freq === "Mensual") {
                    if (periodicity === "Mensual") {
                        exp_add_this_period = amt_raw;
                    } else if (periodicity === "Semanal") {
                        const payDay = e_start.getUTCDate();
                        let tempDate = new Date(p_start.getTime());
                        while (tempDate <= p_end) {
                            if (tempDate.getUTCMonth() === e_start.getUTCMonth() && tempDate.getUTCDate() === payDay) {
                                exp_add_this_period = amt_raw;
                                break;
                            }
                            if (tempDate.getUTCFullYear() === e_start.getUTCFullYear() &&
                                tempDate.getUTCMonth() === e_start.getUTCMonth() &&
                                tempDate.getUTCDate() === payDay) {
                                exp_add_this_period = amt_raw;
                                break;
                            }
                            tempDate.setUTCDate(tempDate.getUTCDate() + 1);
                        }
                    }
                } else if (freq === "Único") {
                    if (p_start <= e_start && e_start <= p_end) {
                        exp_add_this_period = amt_raw;
                    }
                } else if (freq === "Semanal") {
                    if (periodicity === "Semanal") {
                        exp_add_this_period = amt_raw;
                    } else if (periodicity === "Mensual") {
                        const daysInMonth = getDaysInMonth(p_start.getUTCFullYear(), p_start.getUTCMonth());
                        exp_add_this_period = amt_raw * (daysInMonth / 7);
                    }
                } else if (freq === "Bi-semanal") {
                    let occurrences = 0;
                    let checkDate = new Date(e_start.getTime());
                    while (checkDate <= p_end && (e_end === null || checkDate <= e_end)) {
                        if (checkDate >= p_start) {
                            occurrences++;
                        }
                        checkDate = addWeeks(checkDate, 2);
                    }
                    exp_add_this_period = amt_raw * occurrences;
                }

                if (exp_add_this_period > 0) {
                    p_temp_expenses_by_cat[cat] = (p_temp_expenses_by_cat[cat] || 0) + exp_add_this_period;
                }
            });

            // Apply Reimbursements to p_temp_expenses_by_cat for this period
            (data.incomes || []).forEach(reimbInc => {
                if (!reimbInc.is_reimbursement || !reimbInc.reimbursement_category || !reimbInc.start_date) return;

                const reimb_start = reimbInc.start_date; // Date object
                const reimb_end = reimbInc.end_date;     // Date object or null
                const reimb_amount_raw = parseFloat(reimbInc.net_monthly || 0);
                const reimb_freq = reimbInc.frequency || "Mensual";
                const reimb_cat_target = reimbInc.reimbursement_category;

                if (!allCategories.includes(reimb_cat_target)) return; // Target category must exist

                const isActiveRange = (reimb_start <= p_end && (reimb_end === null || reimb_end >= p_start));
                if (!isActiveRange) return;

                let amount_of_reimbursement_in_this_period = 0.0;
                // Similar frequency logic as incomes/expenses to calculate reimbursement amount for *this* period
                if (reimb_freq === "Mensual") {
                    if (periodicity === "Mensual") amount_of_reimbursement_in_this_period = reimb_amount_raw;
                    else if (periodicity === "Semanal") {
                        const payDay = reimb_start.getUTCDate();
                        let tempDate = new Date(p_start.getTime());
                        while(tempDate <= p_end){
                            if(tempDate.getUTCMonth() === reimb_start.getUTCMonth() && tempDate.getUTCDate() === payDay) {amount_of_reimbursement_in_this_period = reimb_amount_raw; break;}
                            if(tempDate.getUTCFullYear() === reimb_start.getUTCFullYear() && tempDate.getUTCMonth() === reimb_start.getUTCMonth() && tempDate.getUTCDate() === payDay) {amount_of_reimbursement_in_this_period = reimb_amount_raw; break;}
                            tempDate.setUTCDate(tempDate.getUTCDate()+1);
                        }
                    }
                } else if (reimb_freq === "Único") {
                    if (p_start <= reimb_start && reimb_start <= p_end) amount_of_reimbursement_in_this_period = reimb_amount_raw;
                } else if (reimb_freq === "Semanal") {
                    if (periodicity === "Semanal") amount_of_reimbursement_in_this_period = reimb_amount_raw;
                    else if (periodicity === "Mensual") {
                        const daysInMonth = getDaysInMonth(p_start.getUTCFullYear(), p_start.getUTCMonth());
                        amount_of_reimbursement_in_this_period = reimb_amount_raw * (daysInMonth / 7);
                    }
                } else if (reimb_freq === "Bi-semanal") {
                    let occurrences = 0; let checkDate = new Date(reimb_start.getTime());
                    while (checkDate <= p_end && (reimb_end === null || checkDate <= reimb_end)) {
                        if (checkDate >= p_start) occurrences++;
                        checkDate = addWeeks(checkDate, 2);
                    }
                    amount_of_reimbursement_in_this_period = reimb_amount_raw * occurrences;
                }

                if (amount_of_reimbursement_in_this_period > 0) {
                    p_temp_expenses_by_cat[reimb_cat_target] = Math.max(0, (p_temp_expenses_by_cat[reimb_cat_target] || 0) - amount_of_reimbursement_in_this_period);
                }
            });

            // Assign final expenses for the period to the main array and sum totals
            let p_fix_exp_total_for_period = 0.0;
            let p_var_exp_total_for_period = 0.0;
            for (const cat_name in p_temp_expenses_by_cat) {
                const cat_expense_final = p_temp_expenses_by_cat[cat_name];
                expenses_by_cat_p[i][cat_name] = cat_expense_final; // Store final per-category expense for this period

                const expenseTypeFinal = expenseCategoriesMap[cat_name] || "Variable";
                if (expenseTypeFinal === "Fijo") {
                    p_fix_exp_total_for_period += cat_expense_final;
                } else {
                    p_var_exp_total_for_period += cat_expense_final;
                }
            }
            fixed_exp_p[i] = p_fix_exp_total_for_period;
            var_exp_p[i] = p_var_exp_total_for_period;

            // Calculate Net Flow and Ending Balance for the period
            const net_flow_for_period = income_p[i] - (fixed_exp_p[i] + var_exp_p[i]);
            net_flow_p[i] = net_flow_for_period;
            const end_bal_for_period = currentBalance + net_flow_for_period;
            end_bal_p[i] = end_bal_for_period;

            currentBalance = end_bal_for_period; // Update balance for next period's start
            currentDate = (periodicity === "Mensual") ? addMonths(currentDate, 1) : addWeeks(currentDate, 1); // Move to next period
        }
        return { periodDates, income_p, fixed_exp_p, var_exp_p, net_flow_p, end_bal_p, expenses_by_cat_p };
    }

    // --- LÓGICA PESTAÑA GRÁFICO ---
    function renderCashflowChart(periodDates, incomes, totalExpenses, netFlows, endBalances) {
        if (!cashflowChartCanvas) return;
        if (cashflowChartInstance) cashflowChartInstance.destroy(); // Clear previous chart

        if (!periodDates || periodDates.length === 0) {
            if (chartMessage) chartMessage.textContent = "No hay datos suficientes para generar el gráfico.";
            return;
        }
        if (chartMessage) chartMessage.textContent = ""; // Clear message if data exists

        const labels = periodDates.map(date =>
            currentBackupData.analysis_periodicity === "Semanal"
                ? `Sem ${getWeekNumber(date)[1]} ${getWeekNumber(date)[0]}` // Week Number Year
                : `${MONTH_NAMES_ES[date.getUTCMonth()]} ${date.getUTCFullYear()}` // Month Year
        );

        cashflowChartInstance = new Chart(cashflowChartCanvas, {
            type: 'line', // Main chart type
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Saldo Final Estimado',
                        data: endBalances,
                        borderColor: 'rgba(54, 162, 235, 1)', // Blue
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        tension: 0.1,
                        fill: false, // No fill for line chart
                        pointRadius: 4,
                        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        order: 1 // Draw line first
                    },
                    {
                        label: 'Ingreso Total Neto',
                        data: incomes,
                        borderColor: 'rgba(75, 192, 192, 1)', // Green/Teal
                        backgroundColor: 'rgba(75, 192, 192, 1)', // Solid for scatter points
                        type: 'scatter', // Show as points
                        showLine: false, // No line connecting scatter points
                        pointRadius: 6,
                        pointStyle: 'circle',
                        order: 2 // Draw scatter points on top
                    },
                    {
                        label: 'Gasto Total', // Sum of fixed and variable
                        data: totalExpenses.map(e => -e), // Show as positive on chart if desired, or keep as cost
                        borderColor: 'rgba(255, 99, 132, 1)', // Red
                        backgroundColor: 'rgba(255, 99, 132, 1)',
                        type: 'scatter',
                        showLine: false,
                        pointRadius: 6,
                        pointStyle: 'rectRot', // Rotated rectangle
                        order: 2
                    },
                    {
                        label: 'Flujo Neto del Período',
                        data: netFlows,
                        borderColor: 'rgba(255, 206, 86, 1)', // Yellow/Orange
                        backgroundColor: 'rgba(255, 206, 86, 1)',
                        type: 'scatter',
                        showLine: false,
                        pointRadius: 6,
                        pointStyle: 'triangle',
                        order: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: `Monto (${currentBackupData.display_currency_symbol || '$'})`
                        }
                        // You can add beginAtZero: true if preferred, but for balance it might go negative
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    // For 'Gasto Total', if data is stored as positive costs, show as negative in tooltip
                                    // Or adjust data array: totalExpenses.map(e => e) if you want to show positive costs
                                    label += formatCurrencyJS(context.parsed.y, currentBackupData.display_currency_symbol || '$');
                                }
                                return label;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    // --- LÓGICA PESTAÑA BABY STEPS ---
    function renderBabySteps() {
        if (!babyStepsContainer || !currentBackupData || !currentBackupData.baby_steps_status) return;
        babyStepsContainer.innerHTML = ''; // Clear previous content
        BABY_STEPS_DATA_JS.forEach((stepData, stepIndex) => {
            const stepDiv = document.createElement('div'); stepDiv.classList.add('baby-step');
            const title = document.createElement('h3'); title.textContent = stepData.title; stepDiv.appendChild(title);
            const description = document.createElement('p'); description.innerHTML = stepData.description.replace(/\n/g, '<br>'); stepDiv.appendChild(description);

            ['dos', 'donts'].forEach(listType => {
                if (stepData[listType] && stepData[listType].length > 0) {
                    const listTitle = document.createElement('h4');
                    listTitle.textContent = listType === 'dos' ? "✅ Qué haces:" : "❌ Qué no haces:";
                    stepDiv.appendChild(listTitle);
                    const ul = document.createElement('ul');
                    stepData[listType].forEach((itemText, itemIndex) => {
                        const li = document.createElement('li');
                        const checkbox = document.createElement('input'); checkbox.type = 'checkbox';
                        checkbox.id = `step-${stepIndex}-${listType}-${itemIndex}`; // Unique ID for label association

                        // Ensure baby_steps_status and its sub-arrays/objects are initialized
                        if (currentBackupData.baby_steps_status[stepIndex] &&
                            currentBackupData.baby_steps_status[stepIndex][listType]) {
                            checkbox.checked = currentBackupData.baby_steps_status[stepIndex][listType][itemIndex] || false;
                        } else {
                            checkbox.checked = false; // Default if structure is missing
                        }

                        checkbox.addEventListener('change', (e) => {
                            // Ensure structure exists before assignment
                            if (!currentBackupData.baby_steps_status[stepIndex]) currentBackupData.baby_steps_status[stepIndex] = { dos: [], donts: [] }; // Should be pre-initialized though
                            if (!currentBackupData.baby_steps_status[stepIndex][listType]) currentBackupData.baby_steps_status[stepIndex][listType] = []; // Defensive

                            currentBackupData.baby_steps_status[stepIndex][listType][itemIndex] = e.target.checked;
                            // No need to re-render entire baby steps, just update data model
                        });
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
        if (!currentBackupData.reminders_todos) currentBackupData.reminders_todos = []; // Initialize if not exists
        currentBackupData.reminders_todos.push({ text: text, completed: false });
        renderReminders(); resetReminderForm();
    });
    function renderReminders() {
        if (!pendingRemindersList || !completedRemindersList || !currentBackupData) return;
        pendingRemindersList.innerHTML = ''; completedRemindersList.innerHTML = '';
        (currentBackupData.reminders_todos || []).forEach((reminder, index) => {
            const li = document.createElement('li'); li.textContent = reminder.text; li.dataset.index = index;

            const toggleButton = document.createElement('button');
            toggleButton.textContent = reminder.completed ? 'Marcar Pendiente' : 'Marcar Completado';
            toggleButton.classList.add('small-button');
            toggleButton.addEventListener('click', () => {
                reminder.completed = !reminder.completed;
                renderReminders(); // Re-render to move item and update button text
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.classList.add('small-button', 'danger');
            deleteButton.addEventListener('click', () => {
                if (confirm(`¿Eliminar recordatorio "${reminder.text}"?`)) {
                    currentBackupData.reminders_todos.splice(index, 1);
                    renderReminders(); // Re-render to remove item
                }
            });

            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('reminder-actions');
            buttonContainer.appendChild(toggleButton);
            buttonContainer.appendChild(deleteButton);
            li.appendChild(buttonContainer);

            if (reminder.completed) {
                li.classList.add('completed');
                completedRemindersList.appendChild(li);
            } else {
                pendingRemindersList.appendChild(li);
            }
        });
    }

    // --- LÓGICA PESTAÑA LOG (ACTUALIZADA) ---
    function renderLogTab() {
        if (!changeLogList) return;
        changeLogList.innerHTML = ''; // Clear previous entries

        // Use the globally managed changeLogEntries which is updated upon loading/saving data
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
            const date = new Date(entry.timestamp); // Assuming entry.timestamp is an ISO string
            timestampSpan.textContent = `[${date.toLocaleDateString('es-CL')} ${date.toLocaleTimeString('es-CL')}]`;

            const userSpan = document.createElement('span');
            userSpan.classList.add('log-user');
            userSpan.textContent = entry.user || "Desconocido"; // Default if user is not logged

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
    function getWeekNumber(d) { // ISO 8601 week number
        const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7)); // Thursday in current week decides the year.
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7); // Calculate week number
        return [date.getUTCFullYear(), weekNo];
    }
    function getMondayOfWeek(year, week) { // Get Monday of an ISO week
        const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7)); // Approx date
        const dayOfWeek = simple.getUTCDay(); // 0 (Sun) to 6 (Sat)
        const isoDayOfWeek = ((dayOfWeek + 6) % 7) + 1; // 1 (Mon) to 7 (Sun)
        const diff = isoDayOfWeek - 1; // Difference from Monday
        simple.setUTCDate(simple.getUTCDate() - diff);
        return simple;
    }
    function getDaysInMonth(year, month) { // month is 0-indexed
        return new Date(year, month + 1, 0).getUTCDate();
    }


    // --- INICIALIZACIÓN ---
    // initializeUserDatabase(null) is already called at the end of config.js
    showLoginScreen(); // Start with the login screen
    const today = new Date();
    const todayISO = getISODateString(today);
    // Set default dates for forms
    incomeStartDateInput.value = todayISO;
    expenseStartDateInput.value = todayISO;
    analysisStartDateInput.value = todayISO;
    // Disable end date inputs initially as "ongoing" is checked by default
    incomeEndDateInput.disabled = true;
    expenseEndDateInput.disabled = true;
    updateAnalysisDurationLabel(); // Set initial duration label
    // fetchAndUpdateUSDCLPRate(); // Called when adjustments tab is active or main content shows
    incomeReimbursementCategoryContainer.style.display = 'none'; // Hide reimbursement initially
});
```

**Cambio clave realizado en `app.js`:**

El listener `auth.onAuthStateChanged` ha sido modificado así:

```javascript
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in.
            initializeUserDatabase(user.uid); // Establece la instancia de base de datos correcta
            showDataSelectionScreen(user);
        } else {
            // User is signed out.
            initializeUserDatabase(null); // Revierte a la base de datos predeterminada
            showLoginScreen();
        }
    });
```

**Qué hace este cambio:**
1.  Cuando un usuario **inicia sesión exitosamente** (`user` no es nulo):
    * Se llama a `initializeUserDatabase(user.uid)`. Esta función (de `config.js`) ahora establecerá la variable global `database` para que apunte a la instancia de base de datos de `PapasApp` si el UID del usuario coincide con los definidos en `userToAppMap`, o a la de `defaultApp` en caso contrario.
    * Luego se llama a `showDataSelectionScreen(user)`, que a su vez llamará a `fetchBackups()`. `fetchBackups()` ahora usará la instancia de `database` que acaba de ser configurada.
2.  Cuando un usuario **cierra sesión** (`user` es nulo):
    * Se llama a `initializeUserDatabase(null)`. Esto restablece la variable `database` para que apunte a la instancia de `defaultApp.database()`.
    * Se muestra la pantalla de inicio de sesión.

Con esta modificación, el cambio para la conexión dinámica a la base de datos debería estar completo. Por favor, prueba la funcionalidad de inicio de sesión con los diferentes UIDs para confirmar que se conecta a la base de datos correcta y que las operaciones de carga de "backups" funcionan como se espera para cada base de dat
