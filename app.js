document.addEventListener('DOMContentLoaded', () => {
    // Ensure Chart.js zoom plugin is registered
    if (typeof Chart !== 'undefined' && typeof ChartZoom !== 'undefined') {
        Chart.register(ChartZoom);
    }
    const CATEGORY_COLORS = [
        '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
        '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab',
        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
        '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];
    const LOCAL_BACKUP_FILE_TYPE = 'webapp_chile_local_backup_v1';
    const globalCategoryColors = {};
    let nextCategoryColorIndex = 0;
    function getCategoryColor(cat) {
        if (!globalCategoryColors[cat]) {
            globalCategoryColors[cat] = CATEGORY_COLORS[nextCategoryColorIndex % CATEGORY_COLORS.length];
            nextCategoryColorIndex++;
        }
        return globalCategoryColors[cat];
    }

    function toUTCDate(value, fallback = null) {
        if (value instanceof Date) {
            return value;
        }
        if (value === null || value === undefined || value === '') {
            return fallback;
        }
        if (typeof value === 'string') {
            const normalized = value.includes('T') ? value : `${value}T00:00:00Z`;
            const date = new Date(normalized);
            return isNaN(date.getTime()) ? fallback : date;
        }
        const date = new Date(value);
        return isNaN(date.getTime()) ? fallback : date;
    }

    function setElementDisplay(element, displayValue) {
        if (element) {
            element.style.display = displayValue;
        }
    }

    function showElement(element, displayValue = 'block') {
        setElementDisplay(element, displayValue);
    }

    function hideElement(element) {
        setElementDisplay(element, 'none');
    }
    // --- ELEMENTOS GLOBALES ---
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const authStatus = document.getElementById('auth-status');
    const authContainer = document.getElementById('auth-container');
    const loginForm = document.getElementById('login-form');
    const logoutArea = document.getElementById('logout-area');
    const loginError = document.getElementById('login-error');

    const dataSelectionContainer = document.getElementById('data-selection-container');
    const backupSelector = document.getElementById('backup-selector');
    const loadBackupButton = document.getElementById('load-backup-button');
    const loadLatestVersionButton = document.getElementById('load-latest-version-button');
    const loadingMessage = document.getElementById('loading-message');

    const mainContentContainer = document.getElementById('main-content-container');
    const tabsContainer = document.querySelector('.tabs-container');
    const saveChangesButton = document.getElementById('save-changes-button');
    const downloadLocalBackupButton = document.getElementById('download-local-backup-button');
    const importLocalBackupButton = document.getElementById('import-local-backup-button');
    const localBackupFileInput = document.getElementById('local-backup-file-input');
    const cashflowTabButton = tabsContainer ? tabsContainer.querySelector('.tab-button[data-tab="flujo-caja"]') : null;

    // --- ELEMENTOS PESTAÑA AJUSTES ---
    const settingsForm = document.getElementById('settings-form');
    const analysisDurationInput = document.getElementById('analysis-duration-input');
    const analysisDurationLabel = document.getElementById('analysis-duration-label');
    const analysisStartDateInput = document.getElementById('analysis-start-date-input');
    const analysisInitialBalanceInput = document.getElementById('analysis-initial-balance-input');
    const displayCurrencySymbolInput = document.getElementById('display-currency-symbol-input');
    const instantExpenseToggle = document.getElementById('instant-expense-toggle');
    const usdClpInfoLabel = document.getElementById('usd-clp-info-label'); // Etiqueta para mostrar la tasa
    const applySettingsButton = document.getElementById('apply-settings-button');
    const printSummaryButton = document.getElementById('print-summary-button');
    const creditCardForm = document.getElementById('credit-card-form');
    const creditCardNameInput = document.getElementById('credit-card-name');
    const creditCardCutoffInput = document.getElementById('credit-card-cutoff');
    const creditCardPaymentDayInput = document.getElementById('credit-card-payment-day');
    const creditCardsList = document.getElementById('credit-cards-list');
    const creditCardExample = document.getElementById('credit-card-example');
    const addCreditCardButton = document.getElementById('add-credit-card-button');
    const cancelEditCreditCardButton = document.getElementById('cancel-edit-credit-card-button');
    let editingCreditCardIndex = null;

    // --- ELEMENTOS PESTAÑA INGRESOS ---
    const incomeForm = document.getElementById('income-form');
    const incomeNameInput = document.getElementById('income-name');
    const incomeAmountInput = document.getElementById('income-amount');
    const incomeCurrencySelect = document.getElementById('income-currency');
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
    const expenseCurrencySelect = document.getElementById('expense-currency');
    const expenseCategorySelect = document.getElementById('expense-category');
    const addCategoryButton = document.getElementById('add-category-button');
    const removeCategoryButton = document.getElementById('remove-category-button');
    const expenseFrequencySelect = document.getElementById('expense-frequency');
    const expenseMovementDateInput = document.getElementById('expense-movement-date');
    const expensePaymentDateContainer = document.getElementById('expense-payment-date-container');
    const expenseStartDateInput = document.getElementById('expense-start-date');
    const expenseEndDateInput = document.getElementById('expense-end-date');
    const expenseOngoingCheckbox = document.getElementById('expense-ongoing');
    const expenseIsRealCheckbox = document.getElementById('expense-is-real');
    const expensePaymentMethodSelect = document.getElementById('expense-payment-method');
    const expenseCreditCardContainer = document.getElementById('expense-credit-card-container');
    const expenseCreditCardSelect = document.getElementById('expense-credit-card');
    const expenseInstallmentsContainer = document.getElementById('expense-installments-container');
    const expenseInstallmentsInput = document.getElementById('expense-installments');
    const addExpenseButton = document.getElementById('add-expense-button');
    const cancelEditExpenseButton = document.getElementById('cancel-edit-expense-button');
    const expensesTableView = document.querySelector('#expenses-table-view tbody');
    const searchExpenseInput = document.getElementById("search-expense-input");
    const openImportExpensesButtons = document.querySelectorAll(".open-import-expenses");
    const expenseJsonDropZone = document.getElementById('expense-json-drop-zone');
    const expenseJsonFileInput = document.getElementById('expense-json-file-input');
    const importExpensesModal = document.getElementById("import-expenses-modal");
    const importExpensesModalClose = document.getElementById("import-expenses-modal-close");
    const expenseDropZone = document.getElementById("expense-drop-zone");
    const expenseFileInput = document.getElementById('expense-file-input');
    const columnMappingDiv = document.getElementById('column-mapping');
    const mapDateSelect = document.getElementById('map-date');
    const mapDescSelect = document.getElementById('map-description');
    const mapAmountSelect = document.getElementById('map-amount');
    const importTableContainer = document.getElementById('import-table-container');
    const bankProfileSelect = document.getElementById('import-bank-profile');
    const mergeExpensesButton = document.getElementById('merge-expenses-button');
    const importJsonExpensesModal = document.getElementById('import-json-expenses-modal');
    const importJsonExpensesClose = document.getElementById('import-json-expenses-close');
    const jsonExpensesPreview = document.getElementById('json-expenses-preview');
    const addJsonExpensesButton = document.getElementById('add-json-expenses');
    let editingExpenseIndex = null;
    let parsedImportData = [];
    let importHeaders = [];
    const bankProfiles = {
        falabella: {
            matchFileName: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.xlsx$/i,
            columns: { date: 'FECHA', desc: 'DESCRIPCION', amount: 'MONTO' }
        }
    };
    let parsedJsonExpenses = [];
    let lastImportedJsonRange = null;

    const usdClpRateCache = {};
    const usdClpRatePending = {};
    let latestUsdClpRate = null;

    // --- BLOQUEO DE EDICIÓN ---
    let editLockAcquired = false;
    let editLockRef = null;

    // --- ELEMENTOS PESTAÑA PRESUPUESTOS ---
    const budgetForm = document.getElementById('budget-form');
    const budgetCategorySelect = document.getElementById('budget-category-select');
    const budgetAmountInput = document.getElementById('budget-amount-input');
    const saveBudgetButton = document.getElementById('save-budget-button');
    const budgetsTableView = document.querySelector('#budgets-table-view tbody');
    const budgetSummaryTableBody = document.querySelector('#budget-summary-table tbody');
    const budgetPrevPeriodButton = document.getElementById('budget-prev-period-button');
    const budgetNextPeriodButton = document.getElementById('budget-next-period-button');
    const budgetYearSelect = document.getElementById('budget-year-select');
    const budgetMonthSelect = document.getElementById('budget-month-select');
    let currentBudgetViewDate = new Date();

    // --- ELEMENTOS PESTAÑA REGISTRO PAGOS ---
    const paymentsTabTitle = document.getElementById('payments-tab-title');
    const paymentsSubtabs = document.getElementById('payments-subtabs');
    const prevPeriodButton = document.getElementById('prev-period-button');
    const nextPeriodButton = document.getElementById('next-period-button');
    const paymentYearSelect = document.getElementById('payment-year-select');
    const paymentMonthSelect = document.getElementById('payment-month-select');
    const paymentWeekSelect = document.getElementById('payment-week-select');
    const paymentsTableView = document.querySelector('#payments-table-view tbody');
    let currentPaymentViewDate = new Date();

    // --- ELEMENTOS PESTAÑA FLUJO DE CAJA ---
    const cashflowMensualTableBody = document.querySelector('#cashflow-mensual-table tbody');
    const cashflowMensualTableHead = document.querySelector('#cashflow-mensual-table thead');
    const cashflowMensualTitle = document.getElementById('cashflow-mensual-title');

    const cashflowSemanalTableBody = document.querySelector('#cashflow-semanal-table tbody');
    const cashflowSemanalTableHead = document.querySelector('#cashflow-semanal-table thead');
    const cashflowSemanalTitle = document.getElementById('cashflow-semanal-title');
    const cashflowDiarioTableBody = document.querySelector('#cashflow-diario-table tbody');
    const cashflowDiarioTableHead = document.querySelector('#cashflow-diario-table thead');
    const cashflowDiarioTitle = document.getElementById('cashflow-diario-title');
    const cashflowSubtabs = document.getElementById('cashflow-subtabs');
    const cashflowMensualContainer = document.getElementById('cashflow-mensual-container');
    const cashflowSemanalContainer = document.getElementById('cashflow-semanal-container');
    const cashflowDiarioContainer = document.getElementById('cashflow-diario-container');

    // --- ELEMENTOS PESTAÑA GRÁFICO ---
    const cashflowChartCanvas = document.getElementById('cashflow-chart');
    const chartMessage = document.getElementById('chart-message');
    const mobileChartStartInput = document.getElementById('mobile-chart-start');
    const mobileChartEndInput = document.getElementById('mobile-chart-end');
    const applyMobileChartRangeButton = document.getElementById('apply-mobile-chart-range');
    const chartSubtabs = document.getElementById('chart-subtabs');
    const graficoTitle = document.getElementById('grafico-title');
    const pieMonthInputs = [
        document.getElementById('pie-month-input-1'),
        document.getElementById('pie-month-input-2'),
        document.getElementById('pie-month-input-3')
    ];
    const pieWeekInputs = [
        document.getElementById('pie-week-input-1'),
        document.getElementById('pie-week-input-2'),
        document.getElementById('pie-week-input-3')
    ];
    const pieMonthCanvases = [
        document.getElementById('pie-chart-month-1'),
        document.getElementById('pie-chart-month-2'),
        document.getElementById('pie-chart-month-3')
    ];
    const pieWeekCanvases = [
        document.getElementById('pie-chart-week-1'),
        document.getElementById('pie-chart-week-2'),
        document.getElementById('pie-chart-week-3')
    ];
    const pieMonthContainer = document.getElementById('pie-month-container');
    const pieWeekContainer = document.getElementById('pie-week-container');
    const pieMonthLegend = document.getElementById('pie-month-legend');
    const pieWeekLegend = document.getElementById('pie-week-legend');
    const chartModal = document.getElementById('chart-modal');
    const chartModalClose = document.getElementById('chart-modal-close');
    const chartModalTitle = document.getElementById('chart-modal-title');
    const chartModalTableBody = document.querySelector('#chart-modal-table tbody');
    const chartDatasetToggles = Array.from(document.querySelectorAll('.chart-dataset-toggle'));
    const chartLineStyleSelect = document.getElementById('chart-line-style');
    const chartKpiBalance = document.getElementById('chart-kpi-balance');
    const chartKpiPeriod = document.getElementById('chart-kpi-period');
    const chartKpiAvgNet = document.getElementById('chart-kpi-avg-net');
    const chartKpiAvgNetDetail = document.getElementById('chart-kpi-avg-net-detail');
    const chartKpiMaxExpense = document.getElementById('chart-kpi-max-expense');
    const chartKpiMaxExpensePeriod = document.getElementById('chart-kpi-max-expense-period');
    const chartKpiCoverage = document.getElementById('chart-kpi-coverage');
    const resetChartZoomButton = document.getElementById('reset-chart-zoom-button');
    const exportChartButton = document.getElementById('export-chart-button');
    let cashflowChartInstance = null;
    const pieMonthChartInstances = [null, null, null];
    const pieWeekChartInstances = [null, null, null];
    let chartZoomMode = false;
    const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    let fullChartData = null;
    let activeCashflowPeriodicity = 'Mensual';
    let activePaymentsPeriodicity = 'Mensual';
    const cashflowPeriodDatesMap = { Mensual: [], Semanal: [], Diario: [] };
    const cashflowCategoryTotalsMap = { Mensual: [], Semanal: [], Diario: [] };
    const breakdownPopup = document.getElementById('cashflow-breakdown-popup');
    let hoverTimer = null;
    let hoverStartX = 0;
    let hoverStartY = 0;
    let hoveredCell = null;

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
    const DATE_DAY_FORMAT = (date) => `${('0' + date.getUTCDate()).slice(-2)}/${('0' + (date.getUTCMonth() + 1)).slice(-2)}`;
    let currentBackupData = null;
    let originalLoadedData = null;
    let currentBackupKey = null;
    let changeLogEntries = [];
    const FIREBASE_FORBIDDEN_KEY_CHARS = ['.', '$', '#', '[', ']', '/'];
    const FIREBASE_FORBIDDEN_CHARS_DISPLAY = FIREBASE_FORBIDDEN_KEY_CHARS.join(" ");
    const FIREBASE_CHAR_SAFE_MAP = {
        '.': '．', // fullwidth dot
        '$': '﹩', // small dollar sign
        '#': '＃', // fullwidth hash
        '[': '［', // fullwidth left bracket
        ']': '］', // fullwidth right bracket
        '/': '／', // fullwidth slash
    };
    const FIREBASE_CHAR_REVERSE_MAP = Object.fromEntries(Object.entries(FIREBASE_CHAR_SAFE_MAP).map(([bad, good]) => [good, bad]));

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
        "Supermercado": "Variable", "Auto": "Variable", "Delivery": "Variable", "Salidas a comer": "Variable", "Minimarket": "Variable", "Uber": "Variable", "Regalos para alguien": "Variable", "Otros": "Variable", "Cosas de Casa": "Variable", "Salud": "Variable", "Panoramas": "Variable", "Ropa": "Variable", "Deporte": "Variable", "Vega": "Variable", "Transporte Público": "Variable"
    };

    // --- VALIDACIÓN DE CLAVES DE FIREBASE ---
    function isFirebaseKeySafe(text) {
        if (typeof text !== 'string' || !text.trim()) {
            return false;
        }
        return !FIREBASE_FORBIDDEN_KEY_CHARS.some(char => text.includes(char));
    }

    function encodeFirebaseSafeText(text) {
        if (typeof text !== 'string') return text;
        return Array.from(text).map(ch => FIREBASE_CHAR_SAFE_MAP[ch] || ch).join('');
    }

    function decodeFirebaseSafeText(text) {
        if (typeof text !== 'string') return text;
        return Array.from(text).map(ch => FIREBASE_CHAR_REVERSE_MAP[ch] || ch).join('');
    }

    function normalizeFirebaseKeyText(text) {
        if (text === null || text === undefined) return '';
        return encodeFirebaseSafeText(String(text).trim());
    }

    // --- LÓGICA DE UI ---
    function showLoginScreen() {
        showElement(authContainer);
        showElement(loginForm);
        hideElement(logoutArea);
        hideElement(dataSelectionContainer);
        hideElement(mainContentContainer);
        hideElement(loginError);
        loginError.textContent = '';
        clearAllDataViews();
        currentBackupData = null;
        originalLoadedData = null;
        currentBackupKey = null;
        backupSelector.innerHTML = '<option value="">-- Selecciona una versión --</option>';
        loadLatestVersionButton.disabled = true;
    }

    async function acquireEditLock(user) {
        const ref = getEditLockRefByUID(user.uid);
        if (!ref) return false;
        try {
            const result = await ref.transaction(current => {
                if (current === null || current.uid === user.uid) {
                    return { uid: user.uid, timestamp: firebase.database.ServerValue.TIMESTAMP };
                }
                return;
            });
            if (result.committed && result.snapshot.val() && result.snapshot.val().uid === user.uid) {
                editLockRef = ref;
                editLockAcquired = true;
                ref.onDisconnect().remove();
                return true;
            }
        } catch (e) { }
        return false;
    }

    function releaseEditLock() {
        if (editLockAcquired && editLockRef) {
            editLockRef.remove();
            editLockAcquired = false;
            editLockRef = null;
        }
    }

    async function showDataSelectionScreen(user) {
        showElement(authContainer);
        hideElement(loginForm);
        showElement(logoutArea);
        authStatus.textContent = `Conectado como: ${user.email}`;
        hideElement(dataSelectionContainer);
        hideElement(mainContentContainer);

        const locked = await acquireEditLock(user);
        if (!locked) {
            authStatus.textContent = 'Otro usuario está editando los datos en este momento.';
            return;
        }
        showElement(dataSelectionContainer);
        fetchBackups();
    }

    function showMainContentScreen() {
        showElement(mainContentContainer);
        activateTab('log'); // Activate Log tab by default
        fetchAndUpdateUSDCLPRate(); // Fetch USD/CLP rate when main content is shown
        if (typeof updatePieMonthChart === 'function') updatePieMonthChart();
        if (typeof updatePieWeekChart === 'function') updatePieWeekChart();
    }

    function clearAllDataViews() {
        if (cashflowMensualTableHead) cashflowMensualTableHead.innerHTML = '';
        if (cashflowMensualTableBody) cashflowMensualTableBody.innerHTML = '';
        if (cashflowSemanalTableHead) cashflowSemanalTableHead.innerHTML = '';
        if (cashflowSemanalTableBody) cashflowSemanalTableBody.innerHTML = '';
        if (cashflowDiarioTableHead) cashflowDiarioTableHead.innerHTML = '';
        if (cashflowDiarioTableBody) cashflowDiarioTableBody.innerHTML = '';
        if (cashflowMensualTitle) cashflowMensualTitle.textContent = 'Flujo de Caja - Mensual';
        if (cashflowSemanalTitle) cashflowSemanalTitle.textContent = 'Flujo de Caja - Semanal';
        if (cashflowDiarioTitle) cashflowDiarioTitle.textContent = 'Flujo de Caja - Diario';
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
        pieMonthChartInstances.forEach((ch, idx) => { if (ch) { ch.destroy(); pieMonthChartInstances[idx] = null; } });
        pieWeekChartInstances.forEach((ch, idx) => { if (ch) { ch.destroy(); pieWeekChartInstances[idx] = null; } });
        if (chartMessage) chartMessage.textContent = "El gráfico se generará después de calcular el flujo de caja.";
        if (usdClpInfoLabel) usdClpInfoLabel.textContent = "1 USD = $CLP (Obteniendo...)";
        pieMonthInputs.forEach(inp => { if (inp) inp.value = ''; });
        pieWeekInputs.forEach(inp => { if (inp) inp.value = ''; });
    }

    // --- AUTENTICACIÓN ---
    loginButton.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        authStatus.textContent = "Ingresando...";
        hideElement(loginError);
        loginError.textContent = '';
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                loginError.textContent = 'Usuario o contraseña incorrectos.';
                showElement(loginError);
                authStatus.textContent = '';
            });
    });
    logoutButton.addEventListener('click', () => { releaseEditLock(); auth.signOut(); });
    auth.onAuthStateChanged(user => user ? showDataSelectionScreen(user) : showLoginScreen());

    // --- CARGA DE VERSIONES (BACKUPS) ---

    // Crea la estructura de backup inicial si el usuario no tiene ninguno
    function createInitialBackupIfMissing(userRef) {
        const backupsRef = userRef.child('backups');
        return backupsRef.once('value').then(snapshot => {
            if (!snapshot.exists()) {
                const now = new Date();
                const key = `backup_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}` +
                    `${now.getDate().toString().padStart(2, '0')}T${now.getHours().toString().padStart(2, '0')}` +
                    `${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

                const initialBackup = {
                    analysis_duration: null,
                    analysis_initial_balance: null,
                    analysis_periodicity: "",
                    analysis_start_date: "",
                    baby_steps_status: Array.from({ length: 7 }, () => ({ dos: [], donts: [] })),
                    change_log: [],
                    display_currency_symbol: "",
                    expense_categories: {},
                    version: ""
                };

                return backupsRef.child(key).set(initialBackup).then(() => key);
            }
            return null;
        });
    }

    function fetchBackups() {
        const userRef = getUserDataRef();
        if (!userRef) {
            loadingMessage.textContent = "Error: No se pudo obtener la referencia de datos del usuario.";
            showElement(loadingMessage);
            return;
        }

        loadingMessage.textContent = "Cargando lista de versiones...";
        showElement(loadingMessage);
        loadLatestVersionButton.disabled = true;

        // MODIFICADO: Apunta a `users/${userSubPath}/backups` y limita a las 10 últimas versiones
        userRef.child('backups').orderByKey().limitToLast(10).once('value')
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
                    // Si no hay backups, crea uno inicial y recarga la lista
                    loadingMessage.textContent = "Creando datos iniciales...";
                    createInitialBackupIfMissing(userRef).then(() => {
                        fetchBackups();
                    });
                    return;
                }
                hideElement(loadingMessage);
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

    function createDefaultBackupData() {
        return {
            version: "1.0_web_v3_usd_clp_auto",
            analysis_start_date: new Date(),
            analysis_duration: 12,
            analysis_periodicity: "Mensual",
            analysis_initial_balance: 0,
            display_currency_symbol: "$",
            use_instant_expenses: false,
            incomes: [],
            expense_categories: JSON.parse(JSON.stringify(DEFAULT_EXPENSE_CATEGORIES_JS)),
            expenses: [],
            credit_cards: [],
            payments: {},
            budgets: {},
            baby_steps_status: BABY_STEPS_DATA_JS.map(step => ({
                dos: new Array(step.dos.length).fill(false),
                donts: new Array(step.donts.length).fill(false)
            })),
            reminders_todos: [],
            change_log: []
        };
    }

    function hydrateBackupData(rawData) {
        if (!rawData || typeof rawData !== 'object') {
            return null;
        }

        const hydrated = JSON.parse(JSON.stringify(rawData));

        if (!Array.isArray(hydrated.incomes)) hydrated.incomes = [];
        hydrated.incomes.forEach(inc => {
            if (typeof inc.is_reimbursement === 'undefined') inc.is_reimbursement = false;
            if (typeof inc.reimbursement_category === 'undefined') inc.reimbursement_category = null;
            inc.currency = inc.currency || 'USD';
            if (inc.start_date) inc.start_date = toUTCDate(inc.start_date);
            if (inc.end_date) inc.end_date = toUTCDate(inc.end_date);
        });

        if (!Array.isArray(hydrated.expenses)) hydrated.expenses = [];
        hydrated.expenses.forEach(exp => {
            if (exp.start_date) exp.start_date = toUTCDate(exp.start_date);
            if (exp.end_date) exp.end_date = toUTCDate(exp.end_date);
            if (exp.movement_date) exp.movement_date = toUTCDate(exp.movement_date);
            else exp.movement_date = exp.start_date ? toUTCDate(exp.start_date) : null;
            if (!exp.payment_method || (typeof exp.payment_method === 'string' && exp.payment_method.toLowerCase() === 'efectivo')) {
                exp.payment_method = 'Efectivo / Debito';
            }
            exp.currency = exp.currency || 'USD';
        });

        if (!hydrated.expense_categories || Object.keys(hydrated.expense_categories).length === 0) {
            hydrated.expense_categories = JSON.parse(JSON.stringify(DEFAULT_EXPENSE_CATEGORIES_JS));
        }

        if (!hydrated.budgets || typeof hydrated.budgets !== 'object') hydrated.budgets = {};
        if (!hydrated.payments || typeof hydrated.payments !== 'object') hydrated.payments = {};

        if (!Array.isArray(hydrated.credit_cards)) {
            hydrated.credit_cards = [];
        } else {
            hydrated.credit_cards.forEach(card => {
                card.cutoff_day = parseInt(card.cutoff_day, 10) || 1;
                card.payment_day = parseInt(card.payment_day, 10) || 1;
            });
        }

        if (!Array.isArray(hydrated.baby_steps_status) || hydrated.baby_steps_status.length === 0) {
            hydrated.baby_steps_status = BABY_STEPS_DATA_JS.map(step => ({
                dos: new Array(step.dos.length).fill(false),
                donts: new Array(step.donts.length).fill(false)
            }));
        }

        if (!Array.isArray(hydrated.reminders_todos)) hydrated.reminders_todos = [];

        let hydratedChangeLog = hydrated.change_log;
        if (!Array.isArray(hydratedChangeLog)) hydratedChangeLog = [];
        hydratedChangeLog.forEach(entry => {
            if (entry && typeof entry === 'object' && !entry.user) {
                entry.user = "Desconocido (Versión Antigua)";
            }
        });
        hydrated.change_log = hydratedChangeLog;

        hydrated.analysis_start_date = toUTCDate(hydrated.analysis_start_date, new Date());
        hydrated.analysis_duration = parseInt(hydrated.analysis_duration, 10) || 12;
        hydrated.analysis_periodicity = hydrated.analysis_periodicity || "Mensual";
        hydrated.analysis_initial_balance = parseFloat(hydrated.analysis_initial_balance) || 0;
        hydrated.display_currency_symbol = hydrated.display_currency_symbol || "$";
        hydrated.use_instant_expenses = !!hydrated.use_instant_expenses;

        return hydrated;
    }

    function applyBackupDataToApp(backupData, key = null) {
        if (!backupData) {
            return;
        }

        currentBackupData = backupData;
        currentBackupKey = key;
        changeLogEntries = backupData.change_log || [];

        originalLoadedData = JSON.parse(JSON.stringify(currentBackupData));

        if (backupSelector) {
            if (key) {
                backupSelector.value = key;
            } else {
                backupSelector.value = '';
            }
        }

        populateSettingsForm();
        renderCreditCards();
        populateExpenseCategoriesDropdowns();
        populateIncomeReimbursementCategoriesDropdown();
        renderIncomesTable();
        renderExpensesTable();
        renderBudgetsTable();
        renderBabySteps();
        renderReminders();
        renderLogTab();

        activePaymentsPeriodicity = currentBackupData.analysis_periodicity || 'Mensual';
        setupPaymentPeriodSelectors();
        setupBudgetPeriodSelectors();
        setPaymentPeriodicity(activePaymentsPeriodicity);
        renderCashflowTable();
        updateAnalysisModeLabels();

        hideElement(dataSelectionContainer);
        hideElement(loadingMessage);
        showMainContentScreen();
    }

    function cloneBackupDataForExport(data) {
        return JSON.parse(JSON.stringify(data, (key, value) => {
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        }));
    }

    function buildLocalBackupPayload() {
        if (!currentBackupData) {
            return null;
        }
        return {
            type: LOCAL_BACKUP_FILE_TYPE,
            savedAt: new Date().toISOString(),
            sourceBackupKey: currentBackupKey || null,
            data: cloneBackupDataForExport(currentBackupData)
        };
    }

    function describePotentialDataLoss(targetData) {
        if (!currentBackupData) {
            return [];
        }
        const differences = generateDetailedChangeLog(targetData, currentBackupData) || [];
        return differences.filter(detail => detail !== "No se detectaron cambios significativos en los datos.");
    }

    function handleLocalBackupFileSelection(event) {
        const file = event.target.files && event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = e => {
            try {
                const text = e.target.result;
                let parsed = JSON.parse(text);
                let metadata = {};
                if (parsed && parsed.type === LOCAL_BACKUP_FILE_TYPE && parsed.data) {
                    metadata = parsed;
                    parsed = parsed.data;
                }

                const hydratedData = hydrateBackupData(parsed);
                if (!hydratedData) {
                    throw new Error('El archivo no contiene una copia de seguridad válida.');
                }

                const lossDetails = describePotentialDataLoss(hydratedData);
                let proceed = true;
                if (lossDetails.length > 0) {
                    const formattedLoss = lossDetails.map(detail => `- ${detail}`).join('\n');
                    const savedAtDate = metadata.savedAt ? new Date(metadata.savedAt) : null;
                    const savedAtText = savedAtDate && !isNaN(savedAtDate.getTime())
                        ? savedAtDate.toLocaleString()
                        : 'archivo seleccionado';
                    proceed = confirm(`Al cargar esta copia de seguridad se reemplazarán los datos actuales por la versión del ${savedAtText}. Podrías perder los siguientes cambios:\n\n${formattedLoss}\n\n¿Deseas continuar?`);
                } else if (currentBackupData) {
                    proceed = confirm('La copia de seguridad seleccionada no introduce cambios significativos respecto a los datos actuales. ¿Deseas cargarla igualmente?');
                } else {
                    proceed = confirm('Se cargará la copia de seguridad seleccionada. ¿Deseas continuar?');
                }

                if (!proceed) {
                    return;
                }

                const keyFromMetadata = metadata.sourceBackupKey || null;
                applyBackupDataToApp(hydratedData, keyFromMetadata);
                if (metadata.savedAt) {
                    const savedDate = new Date(metadata.savedAt);
                    if (!isNaN(savedDate.getTime())) {
                        alert(`Copia de seguridad local cargada correctamente (${savedDate.toLocaleString()}).`);
                    } else {
                        alert('Copia de seguridad local cargada correctamente.');
                    }
                } else {
                    alert('Copia de seguridad local cargada correctamente.');
                }
            } catch (error) {
                console.error('Error al cargar la copia de seguridad local:', error);
                alert(`No se pudo cargar la copia de seguridad: ${error.message}`);
            } finally {
                event.target.value = '';
            }
        };

        reader.onerror = () => {
            alert('No se pudo leer el archivo seleccionado.');
            event.target.value = '';
        };

        reader.readAsText(file);
    }

    function loadSpecificBackup(key) {
        const userRef = getUserDataRef();
        if (!userRef) {
            alert("Error: No se pudo obtener la referencia de datos del usuario para cargar el backup.");
            return;
        }

        loadingMessage.textContent = `Cargando datos de la versión: ${formatBackupKey(key)}...`;
        showElement(loadingMessage);
        hideElement(mainContentContainer);
        clearAllDataViews();
        originalLoadedData = null;

        // MODIFICADO: Apunta a `users/${userSubPath}/backups/${key}`
        userRef.child(`backups/${key}`).once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    const hydratedData = hydrateBackupData(snapshot.val());
                    applyBackupDataToApp(hydratedData, key);
                    if (backupSelector) {
                        backupSelector.value = key;
                    }
                } else {
                    alert("La versión seleccionada no contiene datos válidos o está vacía. Se cargarán los datos por defecto.");
                    const defaultData = hydrateBackupData(createDefaultBackupData());
                    applyBackupDataToApp(defaultData, null);
                }
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

    if (downloadLocalBackupButton) {
        downloadLocalBackupButton.addEventListener('click', () => {
            if (!currentBackupData) {
                alert('No hay datos cargados para guardar como copia local.');
                return;
            }

            const payload = buildLocalBackupPayload();
            if (!payload) {
                alert('No se pudo preparar la copia de seguridad local.');
                return;
            }

            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `copia_seguridad_local_${timestamp}.json`;
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);

            alert('Copia de seguridad local generada. Revisa tu carpeta de descargas.');
        });
    }

    if (importLocalBackupButton && localBackupFileInput) {
        importLocalBackupButton.addEventListener('click', () => {
            localBackupFileInput.click();
        });
        localBackupFileInput.addEventListener('change', handleLocalBackupFileSelection);
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
    
        // Log settings changes
        if (prevData.analysis_periodicity !== currentData.analysis_periodicity) details.push(`Ajuste: Periodicidad cambiada de '${prevData.analysis_periodicity}' a '${currentData.analysis_periodicity}'.`);
        if (prevData.analysis_duration !== currentData.analysis_duration) details.push(`Ajuste: Duración cambiada de ${prevData.analysis_duration} a ${currentData.analysis_duration}.`);
        if (getISODateString(new Date(prevData.analysis_start_date)) !== getISODateString(new Date(currentData.analysis_start_date))) details.push(`Ajuste: Fecha de inicio cambiada de ${getISODateString(new Date(prevData.analysis_start_date))} a ${getISODateString(new Date(currentData.analysis_start_date))}.`);
        if (prevData.analysis_initial_balance !== currentData.analysis_initial_balance) details.push(`Ajuste: Saldo inicial cambiado de ${formatCurrencyJS(prevData.analysis_initial_balance, symbol)} a ${formatCurrencyJS(currentData.analysis_initial_balance, symbol)}.`);
        if (prevData.display_currency_symbol !== currentData.display_currency_symbol) details.push(`Ajuste: Símbolo de moneda cambiado de '${prevData.display_currency_symbol}' a '${currentData.display_currency_symbol}'.`);
    
        // --- Income Change Detection ---
        const prevIncomes = prevData.incomes || [];
        const currentIncomes = currentData.incomes || [];
        let remainingPrevIncomes = [...prevIncomes]; 
    
        currentIncomes.forEach(currentInc => {
            let matchedPrevIncIndex = -1;
            for (let i = 0; i < remainingPrevIncomes.length; i++) {
                const pInc = remainingPrevIncomes[i];
                if (pInc.name === currentInc.name &&
                    getISODateString(new Date(pInc.start_date)) === getISODateString(new Date(currentInc.start_date)) &&
                    pInc.frequency === currentInc.frequency &&
                    (pInc.is_reimbursement || false) === (currentInc.is_reimbursement || false)
                   ) {
                    matchedPrevIncIndex = i;
                    break;
                }
            }
    
            if (matchedPrevIncIndex !== -1) {
                const prevInc = remainingPrevIncomes[matchedPrevIncIndex];
                let mods = [];
                if (prevInc.net_monthly !== currentInc.net_monthly) mods.push(`Monto: ${formatCurrencyJS(prevInc.net_monthly, symbol)} -> ${formatCurrencyJS(currentInc.net_monthly, symbol)}`);
                const prevEndDateStr = prevInc.end_date ? getISODateString(new Date(prevInc.end_date)) : null;
                const currentEndDateStr = currentInc.end_date ? getISODateString(new Date(currentInc.end_date)) : null;
                if (prevEndDateStr !== currentEndDateStr) mods.push(`Fecha Fin: ${prevEndDateStr || 'N/A'} -> ${currentEndDateStr || 'N/A'}`);
                if (currentInc.is_reimbursement && prevInc.reimbursement_category !== currentInc.reimbursement_category) {
                    mods.push(`Categoría Reembolso: ${prevInc.reimbursement_category || 'N/A'} -> ${currentInc.reimbursement_category || 'N/A'}`);
                }
                if (mods.length > 0) {
                    details.push(`Ingreso modificado '${currentInc.name}' (Inicio: ${getISODateString(new Date(currentInc.start_date))}, Freq: ${currentInc.frequency}${currentInc.is_reimbursement ? ', Reembolso' : ''}): ${mods.join(', ')}.`);
                }
                remainingPrevIncomes.splice(matchedPrevIncIndex, 1); 
            } else {
                details.push(`Ingreso agregado: ${currentInc.name} (${formatCurrencyJS(currentInc.net_monthly, symbol)}, ${currentInc.frequency}, Inicio: ${getISODateString(new Date(currentInc.start_date))}${currentInc.end_date ? ', Fin: ' + getISODateString(new Date(currentInc.end_date)) : ''})${currentInc.is_reimbursement ? ` (Reembolso de ${currentInc.reimbursement_category || 'N/A'})` : ''}.`);
            }
        });
    
        remainingPrevIncomes.forEach(prevInc => {
            details.push(`Ingreso eliminado: ${prevInc.name} (${formatCurrencyJS(prevInc.net_monthly, symbol)}, Inicio: ${getISODateString(new Date(prevInc.start_date))}${prevInc.is_reimbursement ? ', Reembolso' : ''}).`);
        });
    
        // --- Expense Change Detection ---
        const prevExpenses = prevData.expenses || [];
        const currentExpenses = currentData.expenses || [];
        let remainingPrevExpenses = [...prevExpenses]; 
    
        currentExpenses.forEach(currentExp => {
            let matchedPrevExpIndex = -1;
            for (let i = 0; i < remainingPrevExpenses.length; i++) {
                const pExp = remainingPrevExpenses[i];
                if (pExp.name === currentExp.name &&
                    getISODateString(new Date(pExp.start_date)) === getISODateString(new Date(currentExp.start_date)) &&
                    pExp.frequency === currentExp.frequency &&
                    pExp.category === currentExp.category
                   ) {
                    matchedPrevExpIndex = i;
                    break;
                }
            }
    
            if (matchedPrevExpIndex !== -1) {
                const prevExp = remainingPrevExpenses[matchedPrevExpIndex];
                let mods = [];
                if (prevExp.amount !== currentExp.amount) mods.push(`Monto: ${formatCurrencyJS(prevExp.amount, symbol)} -> ${formatCurrencyJS(currentExp.amount, symbol)}`);
                const prevEndDateStr = prevExp.end_date ? getISODateString(new Date(prevExp.end_date)) : null;
                const currentEndDateStr = currentExp.end_date ? getISODateString(new Date(currentExp.end_date)) : null;
                if (prevEndDateStr !== currentEndDateStr) mods.push(`Fecha Fin: ${prevEndDateStr || 'N/A'} -> ${currentEndDateStr || 'N/A'}`);
                if ((prevExp.is_real || false) !== (currentExp.is_real || false)) mods.push(`Es Real: ${prevExp.is_real ? 'Sí' : 'No'} -> ${currentExp.is_real ? 'Sí' : 'No'}`);
                if (mods.length > 0) {
                    details.push(`Gasto modificado '${currentExp.name}' (Cat: ${currentExp.category}, Inicio: ${getISODateString(new Date(currentExp.start_date))}, Freq: ${currentExp.frequency}): ${mods.join(', ')}.`);
                }
                remainingPrevExpenses.splice(matchedPrevExpIndex, 1);
            } else {
                details.push(`Gasto agregado: ${currentExp.name} (${formatCurrencyJS(currentExp.amount, symbol)}, Cat: ${currentExp.category}, ${currentExp.frequency}, Inicio: ${getISODateString(new Date(currentExp.start_date))}).`);
            }
        });
    
        remainingPrevExpenses.forEach(prevExp => {
            details.push(`Gasto eliminado: ${prevExp.name} (${formatCurrencyJS(prevExp.amount, symbol)}, Cat: ${prevExp.category}, Inicio: ${getISODateString(new Date(prevExp.start_date))}).`);
        });
    
        // --- Category, Budget, Reminder, etc. ---
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
        Object.keys(currentCategories).forEach(catName => { // Iterate current categories to capture new and modified budgets
            const prevAmount = prevBudgets[catName]; // Can be undefined
            const currentAmount = currentBudgets[catName]; // Can be undefined
    
            if (currentAmount !== undefined && prevAmount !== currentAmount) { // Only log if current is defined and different
                 if (prevAmount === undefined && currentAmount !== 0) { // New budget for existing or new category
                    details.push(`Presupuesto para '${catName}' establecido a: ${formatCurrencyJS(currentAmount, symbol)}.`);
                } else if (prevAmount !== undefined) { // Modified budget for existing category
                    details.push(`Presupuesto para '${catName}' cambiado de ${formatCurrencyJS(prevAmount, symbol)} a ${formatCurrencyJS(currentAmount, symbol)}.`);
                } else if (prevAmount === undefined && currentAmount === 0 && !prevCategories[catName]) {
                    // This case means a new category was added, and its budget is implicitly 0.
                    // We don't need to log "budget set to 0" if the category is new and budget is 0.
                    // The category addition itself is logged above.
                }
            }
        });
         Object.keys(prevBudgets).forEach(catName => {
            if (currentBudgets[catName] === undefined && prevBudgets[catName] !== 0) { // Budget removed for a category that might still exist or was removed
                if (currentCategories[catName]) { // Category still exists, budget explicitly removed (set to 0 or undefined)
                     details.push(`Presupuesto para '${catName}' cambiado de ${formatCurrencyJS(prevBudgets[catName], symbol)} a ${formatCurrencyJS(0, symbol)}.`);
                } else { // Category was removed, and it had a budget
                    details.push(`Presupuesto para categoría eliminada '${catName}' (era ${formatCurrencyJS(prevBudgets[catName], symbol)}) removido.`);
                }
            }
        });
    
        const prevReminders = prevData.reminders_todos || [];
        const currentReminders = currentData.reminders_todos || [];
        currentReminders.forEach((currentRem) => {
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

    function hasUnsavedChanges() {
        if (!originalLoadedData || !currentBackupData) return false;
        const diffs = generateDetailedChangeLog(originalLoadedData, currentBackupData);
        if (!diffs || diffs.length === 0) return false;
        return !(diffs.length === 1 && diffs[0] === "No se detectaron cambios significativos en los datos.");
    }


    // --- GUARDAR CAMBIOS (ÚNICO EVENT LISTENER) - MODIFICADO ---
    saveChangesButton.addEventListener('click', () => {
        if (!currentBackupData) {
            alert("No hay datos cargados para guardar.");
            return;
        }

        const userRef = getUserDataRef(); // OBTENER LA REFERENCIA DEL USUARIO
        if (!userRef) {
            alert("Error: No se pudo obtener la referencia de datos del usuario para guardar.");
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
            use_instant_expenses: false,
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
            if (exp.movement_date) exp.movement_date = getISODateString(new Date(exp.movement_date));
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
        showElement(loadingMessage);

        // MODIFICADO: Apunta a `users/${userSubPath}/backups/${newBackupKey}`
        userRef.child(`backups/${newBackupKey}`).set(dataToSave)
            .then(() => {
                hideElement(loadingMessage);
                alert(`Cambios guardados exitosamente como nueva versión: ${formatBackupKey(newBackupKey)}`);

                currentBackupKey = newBackupKey;
                currentBackupData = JSON.parse(JSON.stringify(dataToSave));

                currentBackupData.analysis_start_date = toUTCDate(currentBackupData.analysis_start_date);
                (currentBackupData.incomes || []).forEach(inc => {
                    if (inc.start_date) inc.start_date = toUTCDate(inc.start_date);
                    if (inc.end_date) inc.end_date = toUTCDate(inc.end_date);
                });
                (currentBackupData.expenses || []).forEach(exp => {
                    if (exp.start_date) exp.start_date = toUTCDate(exp.start_date);
                    if (exp.end_date) exp.end_date = toUTCDate(exp.end_date);
                });
                originalLoadedData = JSON.parse(JSON.stringify(currentBackupData));

                fetchBackups();
                backupSelector.value = newBackupKey;

                renderLogTab();
            })
            .catch(error => {
                hideElement(loadingMessage);
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

        if (tabId === 'flujo-caja') {
            setPeriodicity(activeCashflowPeriodicity, 'cashflow');
        }
        if (tabId === 'grafico') {
            setPeriodicity(activeCashflowPeriodicity, 'chart');
        }
        if (tabId === 'presupuestos') { setupBudgetPeriodSelectors(); renderBudgetsTable(); renderBudgetSummaryTableForSelectedPeriod(); }
        if (tabId === 'registro-pagos') { setupPaymentPeriodSelectors(); setPaymentPeriodicity(activePaymentsPeriodicity); }
        if (tabId === 'ajustes') {
            populateSettingsForm();
            fetchAndUpdateUSDCLPRate(); // Fetch rate when adjustments tab is activated
        }
        if (tabId === 'log') renderLogTab();
    }
    tabsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('tab-button')) activateTab(event.target.dataset.tab);
    });

    function updateAnalysisModeLabels() {
        const instant = currentBackupData && currentBackupData.use_instant_expenses;
        if (cashflowTabButton) cashflowTabButton.textContent = instant ? 'Tabla de Gastos/Ingresos' : 'Flujo de Caja';
        if (cashflowMensualTitle) cashflowMensualTitle.textContent = (instant ? 'Tabla de Gastos/Ingresos' : 'Flujo de Caja') + ' - Mensual';
        if (cashflowSemanalTitle) cashflowSemanalTitle.textContent = (instant ? 'Tabla de Gastos/Ingresos' : 'Flujo de Caja') + ' - Semanal';
        if (cashflowDiarioTitle) cashflowDiarioTitle.textContent = (instant ? 'Tabla de Gastos/Ingresos' : 'Flujo de Caja') + ' - Diario';
        if (graficoTitle) graficoTitle.textContent = (instant ? 'Gráfico de Gastos/Ingresos' : 'Gráfico de Flujo de Caja') + ` - ${activeCashflowPeriodicity}`;
    }

    function setPeriodicity(periodicity, parent) {
        activeCashflowPeriodicity = periodicity;
        if (parent === 'cashflow' && cashflowSubtabs) {
            cashflowSubtabs.querySelectorAll('.subtab-button').forEach(btn => btn.classList.remove('active'));
            const activeBtn = cashflowSubtabs.querySelector(`.subtab-button[data-period="${periodicity}"]`);
            if (activeBtn) activeBtn.classList.add('active');
            if (cashflowMensualContainer && cashflowSemanalContainer && cashflowDiarioContainer) {
                setElementDisplay(cashflowMensualContainer, periodicity === 'Mensual' ? 'block' : 'none');
                setElementDisplay(cashflowSemanalContainer, periodicity === 'Semanal' ? 'block' : 'none');
                setElementDisplay(cashflowDiarioContainer, periodicity === 'Diario' ? 'block' : 'none');
            }
            renderCashflowTable();
        }
        if (parent === 'chart' && chartSubtabs) {
            chartSubtabs.querySelectorAll('.subtab-button').forEach(btn => btn.classList.remove('active'));
            const activeBtn = chartSubtabs.querySelector(`.subtab-button[data-period="${periodicity}"]`);
            if (activeBtn) activeBtn.classList.add('active');
            if (graficoTitle) graficoTitle.textContent = `Gráfico de Flujo de Caja - ${periodicity}`;
            if (pieMonthContainer && pieWeekContainer) {
                setElementDisplay(pieMonthContainer, periodicity === 'Mensual' ? 'block' : 'none');
                setElementDisplay(pieWeekContainer, periodicity === 'Semanal' ? 'block' : 'none');
                if (periodicity === 'Diario') {
                    setElementDisplay(pieMonthContainer, 'none');
                    setElementDisplay(pieWeekContainer, 'none');
                }
            }
            if (periodicity === 'Mensual' && typeof updatePieMonthChart === 'function') updatePieMonthChart();
            if (periodicity === 'Semanal' && typeof updatePieWeekChart === 'function') updatePieWeekChart();
            renderCashflowTable();
        }
    }

    function setPaymentPeriodicity(periodicity) {
        activePaymentsPeriodicity = periodicity;
        if (paymentsSubtabs) {
            paymentsSubtabs.querySelectorAll('.subtab-button').forEach(btn => btn.classList.remove('active'));
            const activeBtn = paymentsSubtabs.querySelector(`.subtab-button[data-period="${periodicity}"]`);
            if (activeBtn) activeBtn.classList.add('active');
        }
        updatePaymentPeriodSelectorVisibility();
        renderPaymentsTableForCurrentPeriod();
    }

    if (cashflowSubtabs) {
        cashflowSubtabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('subtab-button')) setPeriodicity(e.target.dataset.period, 'cashflow');
        });
    }
    if (chartSubtabs) {
        chartSubtabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('subtab-button')) setPeriodicity(e.target.dataset.period, 'chart');
        });
    }
    if (paymentsSubtabs) {
        paymentsSubtabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('subtab-button')) setPaymentPeriodicity(e.target.dataset.period);
        });
    }

    // --- LÓGICA PESTAÑA AJUSTES ---
    function getDateKey(date) {
        if (!(date instanceof Date) || isNaN(date.getTime())) return null;
        return getISODateString(date);
    }

    function isSameUtcDay(dateA, dateB) {
        const keyA = getDateKey(dateA);
        const keyB = getDateKey(dateB);
        return keyA !== null && keyA === keyB;
    }

    function formatDateForCoinGecko(date) {
        const normalized = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        const day = ('0' + normalized.getUTCDate()).slice(-2);
        const month = ('0' + (normalized.getUTCMonth() + 1)).slice(-2);
        const year = normalized.getUTCFullYear();
        return `${day}-${month}-${year}`;
    }

    function storeUsdClpRate(date, rate) {
        if (typeof rate !== 'number' || !isFinite(rate) || rate <= 0) return;
        const key = getDateKey(date);
        if (!key) return;
        usdClpRateCache[key] = rate;
        latestUsdClpRate = rate;
    }

    async function fetchCurrentUsdClpRate() {
        const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=clp';
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Error de red: ${response.status}`);
        }
        const data = await response.json();
        const clpRate = data && data.usd && data.usd.clp;
        if (typeof clpRate !== 'number' || !isFinite(clpRate)) {
            throw new Error('Tasa CLP no encontrada en la respuesta de la API.');
        }
        return clpRate;
    }

    async function fetchHistoricalUsdClpRate(date) {
        const formatted = formatDateForCoinGecko(date);
        const API_URL = `https://api.coingecko.com/api/v3/coins/usd/history?date=${formatted}`;
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Error de red: ${response.status}`);
        }
        const data = await response.json();
        const clpRate = data && data.market_data && data.market_data.current_price && data.market_data.current_price.clp;
        if (typeof clpRate !== 'number' || !isFinite(clpRate)) {
            throw new Error('Tasa CLP histórica no disponible en la respuesta.');
        }
        return clpRate;
    }

    async function fetchUsdClpRateForDate(date) {
        const key = getDateKey(date);
        if (!key) return latestUsdClpRate;
        if (usdClpRateCache[key]) return usdClpRateCache[key];
        if (usdClpRatePending[key]) return usdClpRatePending[key];

        const fetchPromise = (async () => {
            let rate = null;
            const today = new Date();
            try {
                if (isSameUtcDay(date, today)) {
                    rate = await fetchCurrentUsdClpRate();
                } else {
                    const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
                    const targetUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                    if (targetUtc > todayUtc) {
                        rate = await fetchCurrentUsdClpRate();
                    } else {
                        const diffDays = Math.floor((todayUtc - targetUtc) / 86400000);
                        if (diffDays > 365) {
                            console.warn(`Fecha ${key} fuera de rango histórico público, utilizando tasa actual.`);
                            rate = await fetchCurrentUsdClpRate();
                        } else {
                            rate = await fetchHistoricalUsdClpRate(date);
                        }
                    }
                }
            } catch (error) {
                console.warn(`Error obteniendo tasa USD/CLP para ${key}:`, error);
                rate = latestUsdClpRate;
            }

            if (typeof rate === 'number' && rate > 0) {
                storeUsdClpRate(date, rate);
            } else if (latestUsdClpRate && latestUsdClpRate > 0) {
                usdClpRateCache[key] = latestUsdClpRate;
                rate = latestUsdClpRate;
            }

            return rate;
        })();

        usdClpRatePending[key] = fetchPromise;
        try {
            return await fetchPromise;
        } finally {
            delete usdClpRatePending[key];
        }
    }

    async function ensureUsdClpRatesForDates(dates) {
        if (!Array.isArray(dates) || dates.length === 0) return;
        const uniqueDates = new Map();
        dates.forEach(date => {
            if (!(date instanceof Date) || isNaN(date.getTime())) return;
            const key = getDateKey(date);
            if (!key || uniqueDates.has(key)) return;
            uniqueDates.set(key, new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())));
        });

        const fetchers = [];
        uniqueDates.forEach((date, key) => {
            if (!usdClpRateCache[key]) {
                fetchers.push(fetchUsdClpRateForDate(date));
            }
        });

        if (fetchers.length > 0) {
            await Promise.all(fetchers.map(p => p.catch(error => {
                console.warn('No se pudo obtener una de las tasas USD/CLP requeridas:', error);
                return null;
            })));
        }
    }

    function getCachedUsdClpRate(date) {
        if (date instanceof Date && !isNaN(date.getTime())) {
            const key = getDateKey(date);
            if (key && usdClpRateCache[key] && usdClpRateCache[key] > 0) {
                return usdClpRateCache[key];
            }
        }
        return (latestUsdClpRate && latestUsdClpRate > 0) ? latestUsdClpRate : null;
    }

    function convertAmountToUsd(amount, currency, date) {
        const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount || 0);
        if (!currency || currency === 'USD') return isNaN(numericAmount) ? 0 : numericAmount;
        if (currency === 'CLP') {
            const rate = getCachedUsdClpRate(date);
            if (rate && rate > 0) {
                return (isNaN(numericAmount) ? 0 : numericAmount) / rate;
            }
            console.warn('Tasa USD/CLP no disponible, usando monto original sin convertir.');
            return isNaN(numericAmount) ? 0 : numericAmount;
        }
        return isNaN(numericAmount) ? 0 : numericAmount;
    }

    function collectUsdRateDatesForExpenses(expenses, periodStart, periodEnd, useInstantExpenses) {
        const rateDates = [];
        if (!(periodStart instanceof Date) || !(periodEnd instanceof Date)) return rateDates;
        (expenses || []).forEach(exp => {
            if (!exp || exp.currency !== 'CLP') return;
            const { normalizedExpense } = buildExpenseOccurrenceContext(exp, useInstantExpenses);
            if (!normalizedExpense || !normalizedExpense.start_date) return;
            const occurrenceDates = getExpenseOccurrenceDatesInPeriod(normalizedExpense, periodStart, periodEnd, useInstantExpenses);
            occurrenceDates.forEach(date => {
                if (date instanceof Date && !isNaN(date.getTime())) {
                    rateDates.push(new Date(date.getTime()));
                }
            });
        });
        return rateDates;
    }

    function collectUsdRateDatesForIncomes(incomes, periodStart, periodEnd, periodicity) {
        const rateDates = [];
        if (!(periodStart instanceof Date) || !(periodEnd instanceof Date)) return rateDates;
        (incomes || []).forEach(inc => {
            if (!inc || inc.currency !== 'CLP') return;
            const occurrenceDates = getIncomeOccurrenceDatesInPeriod(inc, periodStart, periodEnd, periodicity);
            occurrenceDates.forEach(date => {
                if (date instanceof Date && !isNaN(date.getTime())) {
                    rateDates.push(new Date(date.getTime()));
                }
            });
        });
        return rateDates;
    }

    async function ensureUsdClpRatesForPeriodRange(periodStart, periodEnd, {
        expenses = [],
        incomes = [],
        useInstantExpenses = false,
        periodicity = 'Mensual',
        includeExpenses = true,
        includeIncomes = true
    } = {}) {
        if (!(periodStart instanceof Date) || isNaN(periodStart.getTime()) ||
            !(periodEnd instanceof Date) || isNaN(periodEnd.getTime())) return;
        const rateDateCandidates = [];
        if (includeExpenses) {
            rateDateCandidates.push(...collectUsdRateDatesForExpenses(expenses, periodStart, periodEnd, useInstantExpenses));
        }
        if (includeIncomes) {
            rateDateCandidates.push(...collectUsdRateDatesForIncomes(incomes, periodStart, periodEnd, periodicity));
        }
        if (rateDateCandidates.length === 0) return;
        await ensureUsdClpRatesForDates(rateDateCandidates);
    }

    async function fetchAndUpdateUSDCLPRate() {
        if (!usdClpInfoLabel) return;
        usdClpInfoLabel.innerHTML = `1 USD = $CLP (Obteniendo...) <span class="loading-dots"></span>`;
        const today = new Date();
        try {
            const clpRate = await fetchUsdClpRateForDate(today);
            if (typeof clpRate !== 'number' || !isFinite(clpRate) || clpRate <= 0) {
                throw new Error('Tasa CLP no disponible.');
            }
            usdClpInfoLabel.textContent = `1 USD = ${clpRate.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Fuente: CoinGecko)`;
        } catch (error) {
            console.warn('No se pudo actualizar el USD/CLP:', error);
            usdClpInfoLabel.innerHTML = `<b>1 USD = N/D</b> <small>(Error al obtener tasa)</small>`;
        }
    }


    function populateSettingsForm() {
        if (!currentBackupData) return;
        analysisDurationInput.value = currentBackupData.analysis_duration || 12;
        analysisStartDateInput.value = getISODateString(currentBackupData.analysis_start_date ? new Date(currentBackupData.analysis_start_date) : new Date());
        analysisInitialBalanceInput.value = currentBackupData.analysis_initial_balance || 0;
        displayCurrencySymbolInput.value = currentBackupData.display_currency_symbol || "$";
        if (instantExpenseToggle) instantExpenseToggle.checked = !!currentBackupData.use_instant_expenses;
        // usdClpRateInput.value = currentBackupData.usd_clp_rate || ''; // No longer used
        // updateUsdClpInfoLabel(); // This will be handled by fetchAndUpdateUSDCLPRate
        updateAnalysisDurationLabel();
        updateAnalysisModeLabels();
    }
    function updateAnalysisDurationLabel() {
        analysisDurationLabel.textContent = "Duración (Meses):";
    }

    function updateCreditCardExample() {
        if (!creditCardExample) return;
        const cutoff = parseInt(creditCardCutoffInput.value, 10);
        const payDay = parseInt(creditCardPaymentDayInput.value, 10);
        if (!isNaN(cutoff) && cutoff >= 1 && cutoff <= 31 &&
            !isNaN(payDay) && payDay >= 1 && payDay <= 31) {
            const start = cutoff === 31 ? 1 : cutoff + 1;
            creditCardExample.textContent =
                `Ejemplo: seleccionaste día de corte el ${cutoff}, por lo que por ejemplo todo entre el ${start} de enero y ${cutoff} de febrero (ambos incluidos) se pagará el día ${payDay} de marzo.`;
        } else {
            creditCardExample.textContent = '';
        }
    }

    function renderCreditCards() {
        if (!creditCardsList) return;
        creditCardsList.innerHTML = '';
        if (!currentBackupData.credit_cards) currentBackupData.credit_cards = [];
        currentBackupData.credit_cards.forEach((card, idx) => {
            const li = document.createElement('li');
            const prefRadio = document.createElement('input');
            prefRadio.type = 'radio';
            prefRadio.name = 'preferred-credit-card';
            prefRadio.checked = !!card.preferred;
            prefRadio.title = 'Marcar como preferida';
            prefRadio.addEventListener('change', () => {
                currentBackupData.credit_cards.forEach(c => { c.preferred = false; });
                card.preferred = true;
                renderCreditCards();
            });
            li.appendChild(prefRadio);
            const span = document.createElement('span');
            span.textContent = `${card.name} (corte ${card.cutoff_day}, paga día ${card.payment_day || 1})${card.preferred ? ' (Preferida)' : ''}`;
            li.appendChild(span);

            const expensesUsingCard = (currentBackupData.expenses || []).filter(exp => exp.payment_method === 'Credito' && exp.credit_card === card.name);
            const isInUse = expensesUsingCard.length > 0;

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.classList.add('small-button');
            // La edición debe permitirse aunque la tarjeta esté en uso.
            editBtn.title = isInUse ? 'Tarjeta en uso por gastos' : 'Editar tarjeta';
            editBtn.addEventListener('click', () => { loadCreditCardForEdit(idx); });
            li.appendChild(editBtn);

            const delBtn = document.createElement('button');
            delBtn.textContent = 'Eliminar';
            delBtn.classList.add('small-button', 'danger');
            delBtn.title = isInUse ? 'Tarjeta en uso por gastos' : 'Eliminar tarjeta';
            delBtn.addEventListener('click', () => {
                if (isInUse) {
                    const sorted = expensesUsingCard.sort((a, b) => {
                        const da = new Date(a.movement_date || a.start_date || 0);
                        const db = new Date(b.movement_date || b.start_date || 0);
                        return db - da;
                    });
                    const list = sorted.map(exp => `- ${exp.name}`).join('\n');
                    alert(`No se puede eliminar la tarjeta "${card.name}" porque tiene gastos asociados:\n${list}\nCorrige estos gastos manualmente antes de eliminar la tarjeta.`);
                    return;
                }
                if (confirm(`¿Eliminar tarjeta "${card.name}"?`)) {
                    currentBackupData.credit_cards.splice(idx, 1);
                    renderCreditCards();
                }
            });
            li.appendChild(delBtn);

            creditCardsList.appendChild(li);
        });
        populateExpenseCreditCardDropdown();
        updateExpensePaymentDate();
    }

    function populateExpenseCreditCardDropdown() {
        if (!expenseCreditCardSelect) return;
        expenseCreditCardSelect.innerHTML = '';
        const cards = currentBackupData && currentBackupData.credit_cards ? currentBackupData.credit_cards : [];
        let preferredSet = false;
        cards.forEach(card => {
            const option = document.createElement('option');
            option.value = card.name;
            option.textContent = card.name;
            if (card.preferred && !preferredSet) {
                option.selected = true;
                preferredSet = true;
            }
            expenseCreditCardSelect.appendChild(option);
        });
        const preferredCard = cards.find(c => c.preferred);
        if (preferredCard) expenseCreditCardSelect.value = preferredCard.name;
    }

    function calculateCreditCardPaymentDate(movDate, cutoffDay, paymentDay) {
        const cutoff = parseInt(cutoffDay, 10) || 1;
        const payDay = parseInt(paymentDay, 10) || 1;
        let cycleEnd = new Date(Date.UTC(movDate.getUTCFullYear(), movDate.getUTCMonth(), cutoff));
        if (movDate.getUTCDate() > cutoff) {
            cycleEnd.setUTCMonth(cycleEnd.getUTCMonth() + 1);
        }
        const paymentMonth = new Date(Date.UTC(cycleEnd.getUTCFullYear(), cycleEnd.getUTCMonth() + 1, 1));
        const daysInPayMonth = getDaysInMonth(paymentMonth.getUTCFullYear(), paymentMonth.getUTCMonth());
        paymentMonth.setUTCDate(Math.min(payDay, daysInPayMonth));
        return paymentMonth;
    }

    function updateExpensePaymentDate() {
        const movValue = expenseMovementDateInput.value;
        const isCredit = expensePaymentMethodSelect.value === 'Credito';
        setElementDisplay(expensePaymentDateContainer, isCredit ? 'block' : 'none');
        if (!movValue) { expenseStartDateInput.value = ''; return; }
        const movDate = toUTCDate(movValue);
        if (!isCredit) {
            expenseStartDateInput.value = movValue;
        } else {
            const cardName = expenseCreditCardSelect.value;
            const card = currentBackupData && currentBackupData.credit_cards ? currentBackupData.credit_cards.find(c => c.name === cardName) : null;
            if (card) {
                const payDate = calculateCreditCardPaymentDate(movDate, card.cutoff_day, card.payment_day);
                expenseStartDateInput.value = getISODateString(payDate);
            } else {
                expenseStartDateInput.value = movValue;
            }
        }
    }
    // usdClpRateInput.addEventListener('input', updateUsdClpInfoLabel); // No longer used
    // function updateUsdClpInfoLabel() { // No longer used, handled by fetchAndUpdateUSDCLPRate
    //     const rate = parseFloat(usdClpRateInput.value);
    //     usdClpInfoLabel.textContent = (rate && rate > 0) ? `1 USD = ${rate.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "1 USD = $CLP (No se usa en cálculos aún)";
    // }
    applySettingsButton.addEventListener('click', () => {
        if (!currentBackupData) { alert("No hay datos cargados para aplicar ajustes."); return; }
        currentBackupData.analysis_duration = parseInt(analysisDurationInput.value, 10);
        currentBackupData.analysis_start_date = toUTCDate(analysisStartDateInput.value);
        currentBackupData.analysis_initial_balance = parseFloat(analysisInitialBalanceInput.value);
        currentBackupData.display_currency_symbol = displayCurrencySymbolInput.value.trim() || "$";
        currentBackupData.use_instant_expenses = instantExpenseToggle ? instantExpenseToggle.checked : false;
        // currentBackupData.usd_clp_rate = parseFloat(usdClpRateInput.value) || null; // No longer stored

        updateAnalysisDurationLabel();
        alert("Ajustes aplicados. El flujo de caja y el gráfico se recalcularán.");
        renderCashflowTable();
        updateAnalysisModeLabels();
        setupPaymentPeriodSelectors();
        setupBudgetPeriodSelectors();
        setPaymentPeriodicity(activePaymentsPeriodicity);
        renderBudgetsTable();

        renderBudgetSummaryTableForSelectedPeriod();
    });

    if (printSummaryButton) {
        printSummaryButton.addEventListener('click', printCashflowSummary);
    }

    if (creditCardForm) {
        creditCardCutoffInput.addEventListener('input', updateCreditCardExample);
        creditCardPaymentDayInput.addEventListener('input', updateCreditCardExample);
        updateCreditCardExample();

        creditCardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = creditCardNameInput.value.trim();
            const cutoff = parseInt(creditCardCutoffInput.value, 10);
            const payDay = parseInt(creditCardPaymentDayInput.value, 10);
            if (!name) { alert('Ingresa nombre de tarjeta'); return; }
            if (isNaN(cutoff) || cutoff < 1 || cutoff > 31) { alert('Día de corte inválido'); return; }
            if (isNaN(payDay) || payDay < 1 || payDay > 31) { alert('Día de pago inválido'); return; }
            if (!currentBackupData.credit_cards) currentBackupData.credit_cards = [];

            const existingPreferred = editingCreditCardIndex !== null ?
                !!currentBackupData.credit_cards[editingCreditCardIndex].preferred : false;
            const cardData = { name: name, cutoff_day: cutoff, payment_day: payDay, preferred: existingPreferred };
            if (editingCreditCardIndex !== null) {
                const oldName = currentBackupData.credit_cards[editingCreditCardIndex].name;
                currentBackupData.credit_cards[editingCreditCardIndex] = cardData;
                // Actualizar gastos que usen esta tarjeta si cambió el nombre
                if (oldName !== name && currentBackupData.expenses) {
                    currentBackupData.expenses.forEach(exp => {
                        if (exp.payment_method === 'Credito' && exp.credit_card === oldName) {
                            exp.credit_card = name;
                        }
                    });
                }
            } else {
                currentBackupData.credit_cards.push(cardData);
            }

            // Refrescar vista de gastos para reflejar cambios de nombre
            renderExpensesTable();

            renderCreditCards();
            resetCreditCardForm();
        });

        cancelEditCreditCardButton.addEventListener('click', resetCreditCardForm);
    }

    function loadCreditCardForEdit(index) {
        const card = currentBackupData.credit_cards[index];
        creditCardNameInput.value = card.name;
        creditCardCutoffInput.value = card.cutoff_day;
        creditCardPaymentDayInput.value = card.payment_day;
        addCreditCardButton.textContent = 'Guardar Cambios';
        showElement(cancelEditCreditCardButton, 'inline-block');
        editingCreditCardIndex = index;
        updateCreditCardExample();
        document.getElementById('ajustes').scrollIntoView({ behavior: 'smooth' });
    }

    function resetCreditCardForm() {
        creditCardForm.reset();
        creditCardNameInput.value = '';
        creditCardCutoffInput.value = '';
        creditCardPaymentDayInput.value = '';
        addCreditCardButton.textContent = 'Agregar Tarjeta';
        hideElement(cancelEditCreditCardButton);
        editingCreditCardIndex = null;
        updateCreditCardExample();
    }

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
        setElementDisplay(incomeReimbursementCategoryContainer, incomeIsReimbursementCheckbox.checked ? 'block' : 'none');
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


    function getSearchContext(inputElement) {
        const term = (inputElement && typeof inputElement.value === 'string') ? inputElement.value.toLowerCase() : '';
        return {
            term,
            numericTerm: term.replace(/[^0-9]/g, '')
        };
    }

    function matchesSearch(searchContext, stringValues = [], numericValues = []) {
        const { term, numericTerm } = searchContext;
        if (!term) return true;
        const normalizedStrings = Array.isArray(stringValues) ? stringValues : [stringValues];
        const normalizedNumeric = Array.isArray(numericValues) ? numericValues : [numericValues];
        const stringMatch = normalizedStrings.some(value => {
            if (value === null || value === undefined) return false;
            return value.toString().toLowerCase().includes(term);
        });
        if (stringMatch) return true;
        if (!numericTerm) return false;
        return normalizedNumeric.some(value => {
            if (value === null || value === undefined) return false;
            return value.toString().includes(numericTerm);
        });
    }

    function filterItemsWithIndex(items, searchInput, extractor) {
        const searchContext = getSearchContext(searchInput);
        if (!Array.isArray(items)) return [];
        return items.reduce((acc, item, index) => {
            const extracted = extractor ? extractor(item) : {};
            const stringValues = extracted && (extracted.strings || extracted.stringValues) || [];
            const numericValues = extracted && (extracted.numeric || extracted.numericValues) || [];
            if (matchesSearch(searchContext, stringValues, numericValues)) {
                acc.push({ item, index });
            }
            return acc;
        }, []);
    }

    function appendActionButtons(row, onEdit, onDelete) {
        const actionsCell = row.insertCell();
        if (typeof onEdit === 'function') {
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.classList.add('small-button');
            editButton.onclick = onEdit;
            actionsCell.appendChild(editButton);
        }
        if (typeof onDelete === 'function') {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.classList.add('small-button', 'danger');
            deleteButton.onclick = onDelete;
            actionsCell.appendChild(deleteButton);
        }
        return actionsCell;
    }


    incomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = incomeNameInput.value.trim();
        const amount = parseFloat(incomeAmountInput.value);
        const frequency = incomeFrequencySelect.value;
        const currency = incomeCurrencySelect.value || 'USD';
        const startDateValue = incomeStartDateInput.value;
        const endDateValue = incomeEndDateInput.value;
        const isReimbursement = incomeIsReimbursementCheckbox.checked;
        const reimbursementCategory = isReimbursement ? incomeReimbursementCategorySelect.value : null;

        if (!isFirebaseKeySafe(name)) { alert(`El nombre del ingreso "${name}" contiene caracteres no permitidos: ${FIREBASE_FORBIDDEN_CHARS_DISPLAY}.`); return; }
        if (!name) { alert("El nombre del ingreso no puede estar vacío."); return; }
        if (isReimbursement && !reimbursementCategory) { alert("Si es un reembolso, debe seleccionar una categoría de gasto a reembolsar."); return; }


        const startDate = toUTCDate(startDateValue);
        const isOngoing = incomeOngoingCheckbox.checked;
        const endDate = (frequency === 'Único' || isOngoing || !endDateValue) ? null : toUTCDate(endDateValue);

        if (isNaN(amount) || !startDate) { alert("Por favor, completa los campos obligatorios (Nombre, Monto, Fecha Inicio)."); return; }
        if (endDate && startDate && endDate < startDate) { alert("La fecha de fin no puede ser anterior a la fecha de inicio."); return; }

        const incomeEntry = {
            name,
            net_monthly: amount,
            frequency,
            start_date: startDate,
            end_date: endDate,
            is_reimbursement: isReimbursement,
            reimbursement_category: reimbursementCategory,
            currency
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
        if (incomeCurrencySelect) incomeCurrencySelect.value = 'USD';

        incomeIsReimbursementCheckbox.checked = false;
        hideElement(incomeReimbursementCategoryContainer);
        incomeReimbursementCategorySelect.value = '';

        addIncomeButton.textContent = 'Agregar Ingreso';
        hideElement(cancelEditIncomeButton);
        editingIncomeIndex = null;
        incomeStartDateInput.value = getISODateString(currentBackupData && currentBackupData.analysis_start_date ? new Date(currentBackupData.analysis_start_date) : new Date());
    }
    cancelEditIncomeButton.addEventListener('click', resetIncomeForm);

    function renderIncomesTable() {
        if (!incomesTableView || !currentBackupData || !currentBackupData.incomes) return;
        incomesTableView.innerHTML = '';
        const filteredIncomes = filterItemsWithIndex(currentBackupData.incomes, searchIncomeInput, (income) => {
            const amountStr = formatAmountWithCurrency(income.net_monthly, income.currency);
            return {
                strings: [
                    income.name,
                    amountStr,
                    income.frequency,
                    income.is_reimbursement ? 'reembolso' : null,
                    income.is_reimbursement ? income.reimbursement_category : null,
                    income.currency
                ],
                numeric: [amountStr.replace(/[^0-9]/g, '')]
            };
        });

        filteredIncomes.forEach(({ item: income, index }) => {
            const row = incomesTableView.insertRow();
            row.insertCell().textContent = income.name;
            row.insertCell().textContent = formatAmountWithCurrency(income.net_monthly, income.currency);
            row.insertCell().textContent = income.frequency;
            row.insertCell().textContent = income.start_date ? getISODateString(new Date(income.start_date)) : 'N/A';
            row.insertCell().textContent = income.end_date ? getISODateString(new Date(income.end_date)) : (income.frequency === 'Único' ? 'N/A (Único)' : 'Recurrente');

            const typeCell = row.insertCell();
            if (income.is_reimbursement) {
                const reimbursementCategory = income.reimbursement_category || 'N/A';
                typeCell.innerHTML = `Reembolso <span class="reimbursement-icon" title="Reembolso de ${reimbursementCategory}">↺</span>`;
                typeCell.classList.add('reimbursement-income');
            } else {
                typeCell.textContent = 'Ingreso Regular';
            }

            appendActionButtons(row, () => loadIncomeForEdit(index), () => deleteIncome(index));
        });
    }
    searchIncomeInput.addEventListener('input', renderIncomesTable);

    function loadIncomeForEdit(index) {
        const income = currentBackupData.incomes[index];
        incomeNameInput.value = income.name;
        incomeAmountInput.value = income.net_monthly;
        incomeFrequencySelect.value = income.frequency;
        if (incomeCurrencySelect) incomeCurrencySelect.value = income.currency || 'USD';
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
            showElement(incomeReimbursementCategoryContainer);
        } else {
            incomeReimbursementCategorySelect.value = '';
            hideElement(incomeReimbursementCategoryContainer);
        }

        addIncomeButton.textContent = 'Guardar Cambios'; showElement(cancelEditIncomeButton, 'inline-block');
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
    expensePaymentMethodSelect.addEventListener('change', () => {
        const isCredit = expensePaymentMethodSelect.value === 'Credito';
        setElementDisplay(expenseCreditCardContainer, isCredit ? 'block' : 'none');
        setElementDisplay(expensePaymentDateContainer, isCredit ? 'block' : 'none');
        if (expenseInstallmentsContainer) setElementDisplay(expenseInstallmentsContainer, isCredit ? 'block' : 'none');
        updateExpensePaymentDate();
    });
    expenseMovementDateInput.addEventListener('change', updateExpensePaymentDate);
    expenseCreditCardSelect.addEventListener('change', updateExpensePaymentDate);
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
        const currency = expenseCurrencySelect.value || 'USD';
        const startDateValue = expenseStartDateInput.value;
        const endDateValue = expenseEndDateInput.value;

        if (!isFirebaseKeySafe(name)) { alert(`El nombre del gasto "${name}" contiene caracteres no permitidos.`); return; }
        if (!name) { alert("El nombre del gasto no puede estar vacío."); return; }
        if (!category) { alert("Selecciona una categoría."); return; }
        if (!isFirebaseKeySafe(category)) { alert(`Categoría "${category}" con nombre no permitido.`); return; }

        const startDate = toUTCDate(startDateValue);
        const isOngoing = expenseOngoingCheckbox.checked;
        const endDate = (frequency === 'Único' || isOngoing || !endDateValue) ? null : toUTCDate(endDateValue);
        const installments = parseInt(expenseInstallmentsInput ? expenseInstallmentsInput.value : '1', 10) || 1;
        const isReal = expenseIsRealCheckbox.checked;

        if (isNaN(amount) || !category || !startDate) { alert("Completa los campos obligatorios (Nombre, Monto, Categoría, Fecha Inicio)."); return; }
        if (endDate && startDate && endDate < startDate) { alert("Fecha de fin no puede ser anterior a fecha de inicio."); return; }

        const expenseType = currentBackupData.expense_categories[category] || "Variable";
        const movementDate = expenseMovementDateInput.value ? toUTCDate(expenseMovementDateInput.value) : startDate;
        const paymentMethod = expensePaymentMethodSelect.value;
        const creditCard = paymentMethod === 'Credito' ? expenseCreditCardSelect.value : null;
        const expenseEntry = { name, amount, category, type: expenseType, frequency, start_date: startDate, end_date: endDate, is_real: isReal, movement_date: movementDate, payment_method: paymentMethod, credit_card: creditCard, installments, currency };

        if (editingExpenseIndex !== null) {
            currentBackupData.expenses[editingExpenseIndex] = expenseEntry;
        } else {
            if (!currentBackupData.expenses) currentBackupData.expenses = [];
            currentBackupData.expenses.push(expenseEntry);
        }
        renderExpensesTable(); renderCashflowTable(); resetExpenseForm();
    });
    function resetExpenseForm() {
        expenseForm.reset(); // This might trigger a change event on expenseFrequencySelect if its value changes

        // Set frequency to 'Único' first
        expenseFrequencySelect.value = 'Único';

        // Now, explicitly set the state for 'Único' frequency
        expenseOngoingCheckbox.checked = false;
        expenseOngoingCheckbox.disabled = true;
        expenseEndDateInput.disabled = true;
        expenseEndDateInput.value = '';
        expenseIsRealCheckbox.checked = true;
        if (expenseCurrencySelect) expenseCurrencySelect.value = 'USD';
        populateExpenseCreditCardDropdown();
        expensePaymentMethodSelect.value = 'Efectivo / Debito';
        expensePaymentMethodSelect.dispatchEvent(new Event('change'));
        if (expenseInstallmentsInput) expenseInstallmentsInput.value = '1';

        const preferredCard = currentBackupData && currentBackupData.credit_cards ? currentBackupData.credit_cards.find(c => c.preferred) : null;
        if (preferredCard) expenseCreditCardSelect.value = preferredCard.name;

        // ... (rest of the function, e.g., setting default category, button text, etc.)
        if (expenseCategorySelect.options.length > 0 && expenseCategorySelect.value === "") {
            if (expenseCategorySelect.options[0].value !== "") expenseCategorySelect.selectedIndex = 0;
            else if (expenseCategorySelect.options.length > 1) expenseCategorySelect.selectedIndex = 1;
        }
        addExpenseButton.textContent = 'Agregar Gasto';
        hideElement(cancelEditExpenseButton);
        editingExpenseIndex = null;
        const defaultDate = getISODateString(new Date());
        expenseMovementDateInput.value = defaultDate;
        updateExpensePaymentDate();
        updateRemoveCategoryButtonState();
    }
    cancelEditExpenseButton.addEventListener('click', resetExpenseForm);
    function renderExpensesTable() {
        if (!expensesTableView || !currentBackupData || !currentBackupData.expenses) return;
        expensesTableView.innerHTML = '';
        const filteredExpenses = filterItemsWithIndex(currentBackupData.expenses, searchExpenseInput, (expense) => {
            const amountStr = formatAmountWithCurrency(expense.amount, expense.currency);
            return {
                strings: [
                    expense.name,
                    amountStr,
                    expense.category,
                    expense.frequency,
                    expense.payment_method === 'Credito' ? 'tarjeta' : 'efectivo / debito',
                    expense.currency
                ],
                numeric: [amountStr.replace(/[^0-9]/g, '')]
            };
        });
        filteredExpenses.forEach(({ item: expense, index }) => {
            const row = expensesTableView.insertRow();
            const nameCell = row.insertCell();
            const nameDiv = document.createElement('div');
            nameDiv.textContent = expense.name;
            nameDiv.classList.add('name-scroll');
            nameCell.classList.add('expense-name-cell');
            nameCell.appendChild(nameDiv);
            row.insertCell().textContent = formatAmountWithCurrency(expense.amount, expense.currency);
            row.insertCell().textContent = expense.category;
            row.insertCell().textContent = expense.frequency;
            row.insertCell().textContent = expense.movement_date ? getISODateString(new Date(expense.movement_date)) : (expense.start_date ? getISODateString(new Date(expense.start_date)) : 'N/A');
            row.insertCell().textContent = expense.start_date ? getISODateString(new Date(expense.start_date)) : 'N/A';
            row.insertCell().textContent = expense.end_date ? getISODateString(new Date(expense.end_date)) : (expense.frequency === 'Único' ? 'N/A (Único)' : 'Recurrente');
            row.insertCell().textContent = expense.payment_method === 'Credito' ? 'Tarjeta' : 'Efectivo / Debito';
            row.insertCell().textContent = expense.is_real ? 'Sí' : 'No';
            appendActionButtons(row, () => loadExpenseForEdit(index), () => deleteExpense(index));
        });
    }
    searchExpenseInput.addEventListener('input', renderExpensesTable);
    function loadExpenseForEdit(index) {
        const expense = currentBackupData.expenses[index];
        expenseNameInput.value = expense.name; expenseAmountInput.value = expense.amount;
        expenseCategorySelect.value = expense.category; expenseFrequencySelect.value = expense.frequency;
        if (expenseCurrencySelect) expenseCurrencySelect.value = expense.currency || 'USD';
        expenseMovementDateInput.value = expense.movement_date ? getISODateString(new Date(expense.movement_date)) : (expense.start_date ? getISODateString(new Date(expense.start_date)) : '');
        expenseStartDateInput.value = expense.start_date ? getISODateString(new Date(expense.start_date)) : '';
        expenseIsRealCheckbox.checked = expense.is_real !== undefined ? expense.is_real : true;
        expensePaymentMethodSelect.value = expense.payment_method || 'Efectivo / Debito';
        const isCreditEdit = expensePaymentMethodSelect.value === 'Credito';
        setElementDisplay(expenseCreditCardContainer, isCreditEdit ? 'block' : 'none');
        setElementDisplay(expensePaymentDateContainer, isCreditEdit ? 'block' : 'none');
        if (expenseInstallmentsContainer) setElementDisplay(expenseInstallmentsContainer, isCreditEdit ? 'block' : 'none');
        if (expenseInstallmentsInput) expenseInstallmentsInput.value = expense.installments || 1;
        if (expense.credit_card) {
            expenseCreditCardSelect.value = expense.credit_card;
        } else {
            const preferredCardEdit = currentBackupData && currentBackupData.credit_cards ? currentBackupData.credit_cards.find(c => c.preferred) : null;
            if (preferredCardEdit) expenseCreditCardSelect.value = preferredCardEdit.name;
        }
        const isUnico = expense.frequency === 'Único';
        expenseOngoingCheckbox.disabled = isUnico;
        if (isUnico) {
            expenseOngoingCheckbox.checked = false; expenseEndDateInput.value = ''; expenseEndDateInput.disabled = true;
        } else {
            expenseOngoingCheckbox.checked = !expense.end_date;
            expenseEndDateInput.value = expense.end_date ? getISODateString(new Date(expense.end_date)) : '';
            expenseEndDateInput.disabled = expenseOngoingCheckbox.checked;
        }
        addExpenseButton.textContent = 'Guardar Cambios'; showElement(cancelEditExpenseButton, 'inline-block');
        editingExpenseIndex = index; document.getElementById('gastos').scrollIntoView({ behavior: 'smooth' });
        updateExpensePaymentDate();
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

    // --- IMPORTACIÓN MASIVA DE GASTOS ---
    function showImportExpensesModal() {
        if (importExpensesModal) showElement(importExpensesModal, 'flex');
    }
    function closeImportExpensesModal() {
        if (importExpensesModal) hideElement(importExpensesModal);
        parsedImportData = [];
        importHeaders = [];
        if (importTableContainer) importTableContainer.innerHTML = '';
        hideElement(columnMappingDiv);
        if (bankProfileSelect) bankProfileSelect.value = 'auto';
        const bankProfileDiv = document.getElementById('bank-profile');
        hideElement(bankProfileDiv);
    }
    function parseExcelDate(val) {
        if (val === undefined || val === null) return null;
        if (typeof val === 'number') {
            const d = XLSX.SSF.parse_date_code(val);
            if (!d) return null;
            return new Date(Date.UTC(d.y, d.m - 1, d.d));
        }
        const tryDate = new Date(val);
        if (!isNaN(tryDate)) {
            return new Date(Date.UTC(tryDate.getFullYear(), tryDate.getMonth(), tryDate.getDate()));
        }
        const parts = String(val).split(/[\/\-]/);
        if (parts.length === 3) {
            let [p1,p2,p3] = parts.map(p=>p.trim());
            if (p3.length === 2) p3 = '20'+p3;
            let day = parseInt(p1,10), month = parseInt(p2,10);
            if (day > 12 && month <= 12) { const tmp = day; day = month; month = tmp; }
            const y = parseInt(p3,10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(y)) {
                return new Date(Date.UTC(y, month-1, day));
            }
        }
        return null;
    }
    function parseAmountString(val) {
        if (val === undefined || val === null || val === '') return 0;
        if (typeof val === 'number') return val;
        const raw = String(val).trim();
        if (!raw) return 0;
        let cleaned = raw.replace(/[^0-9,.-]/g, '');
        const hasComma = cleaned.includes(',');
        const hasDot = cleaned.includes('.');
        if (hasComma && hasDot) {
            cleaned = cleaned.replace(/,/g, '');
        } else if (hasComma && !hasDot) {
            cleaned = cleaned.replace(/,/g, '.');
        }
        const dotParts = cleaned.split('.');
        if (dotParts.length > 2) {
            const decimal = dotParts.pop();
            cleaned = dotParts.join('') + '.' + decimal;
        }
        const amount = parseFloat(cleaned);
        return isNaN(amount) ? 0 : amount;
    }
    function parseAmountOrNull(val) {
        if (val === undefined || val === null) return null;
        const trimmed = String(val).trim();
        if (!trimmed) return null;
        const parsed = parseAmountString(trimmed);
        return isNaN(parsed) ? null : parsed;
    }
    function checkExpenseDuplicate(name, dateStr, amount) {
        const normalizedIncomingName = normalizeFirebaseKeyText(name);
        return (currentBackupData.expenses || []).some(exp => {
            const expDate = exp.movement_date ? getISODateString(new Date(exp.movement_date)) : (exp.start_date ? getISODateString(new Date(exp.start_date)) : '');
            const existingAmount = exp.amount === undefined || exp.amount === null ? null : parseFloat(exp.amount);
            const incomingAmount = amount === undefined || amount === null ? null : parseFloat(amount);
            const normalizedExistingName = normalizeFirebaseKeyText(exp.name);
            if (incomingAmount === null || isNaN(incomingAmount)) {
                return expDate === dateStr && normalizedExistingName === normalizedIncomingName && (existingAmount === null || isNaN(existingAmount));
            }
            return expDate === dateStr && normalizedExistingName === normalizedIncomingName && parseFloat(existingAmount) === incomingAmount;
        });
    }
    function createCategorySelect() {
        const sel = document.createElement('select');
        if (currentBackupData && currentBackupData.expense_categories) {
            const cats = Object.keys(currentBackupData.expense_categories).sort();
            cats.forEach(c => {
                if (isFirebaseKeySafe(c)) {
                    const opt = document.createElement('option');
                    opt.value = c; opt.textContent = c;
                    sel.appendChild(opt);
                }
            });
        }
        return sel;
    }
    function applyBankProfile(profileKey) {
        const profile = bankProfiles[profileKey];
        if (profile && profile.columns) {
            mapDateSelect.value = importHeaders.find(h => h.toLowerCase() === profile.columns.date.toLowerCase()) || '';
            mapDescSelect.value = importHeaders.find(h => h.toLowerCase() === profile.columns.desc.toLowerCase()) || '';
            mapAmountSelect.value = importHeaders.find(h => h.toLowerCase() === profile.columns.amount.toLowerCase()) || '';
        } else {
            mapDateSelect.value = importHeaders.find(h => /fecha/i.test(h)) || '';
            mapDescSelect.value = importHeaders.find(h => /desc/i.test(h)) || '';
            mapAmountSelect.value = importHeaders.find(h => /monto/i.test(h)) || '';
        }
        renderImportTable();
    }
    function renderMappingSelectors() {
        if (!columnMappingDiv) return;
        const selects = [mapDateSelect, mapDescSelect, mapAmountSelect];
        selects.forEach(sel => { sel.innerHTML = '<option value="">--</option>'; });
        importHeaders.forEach(h => {
            selects.forEach(sel => {
                const opt = document.createElement('option'); opt.value = h; opt.textContent = h; sel.appendChild(opt);
            });
        });
        applyBankProfile(bankProfileSelect ? bankProfileSelect.value : 'auto');
        showElement(columnMappingDiv, 'flex');
        const bankProfileDiv = document.getElementById('bank-profile');
        if (bankProfileDiv) showElement(bankProfileDiv, 'flex');
    }
    function renderImportTable() {
        if (!importTableContainer) return;
        importTableContainer.innerHTML = '';
        const dateCol = mapDateSelect.value;
        const descCol = mapDescSelect.value;
        const amountCol = mapAmountSelect.value;
        if (!dateCol || !descCol || !amountCol) return;
        const table = document.createElement('table');
        table.classList.add('import-preview-table');
        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th>Importar</th><th>Fecha</th><th>Descripción</th><th>Monto</th><th>Categoría</th><th>Duplicado?</th></tr>';
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        parsedImportData.forEach((row, idx) => {
            const dateObj = parseExcelDate(row[dateCol]);
            const dateStr = dateObj ? getISODateString(dateObj) : '';
            const desc = row[descCol] !== undefined ? String(row[descCol]) : '';
            const amt = row[amountCol];
            const isDup = checkExpenseDuplicate(desc, dateStr, parseFloat(amt));
            const tr = document.createElement('tr');
            if (isDup) tr.classList.add('duplicate-row');
            const chkCell = tr.insertCell();
            const chk = document.createElement('input'); chk.type='checkbox'; chk.dataset.index = idx; chk.checked = !isDup; if (isDup) chk.disabled = true; chkCell.appendChild(chk);
            tr.insertCell().textContent = dateStr || String(row[dateCol] || '');
            tr.insertCell().textContent = desc;
            tr.insertCell().textContent = amt;
            const catCell = tr.insertCell();
            const sel = createCategorySelect(); sel.dataset.index = idx; catCell.appendChild(sel);
            tr.insertCell().textContent = isDup ? 'Sí' : 'No';
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        importTableContainer.appendChild(table);
    }
    function handleExpenseFile(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const wb = XLSX.read(data, { type: 'array' });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            if (!json.length) return;
            importHeaders = json[0];
            parsedImportData = json.slice(1).map(r => {
                const obj = {};
                importHeaders.forEach((h,i)=>{ obj[h] = r[i]; });
                return obj;
            });
            let detected = 'auto';
            for (const [key, prof] of Object.entries(bankProfiles)) {
                if (prof.matchFileName && prof.matchFileName.test(file.name)) {
                    detected = key; break;
                }
            }
            if (bankProfileSelect) bankProfileSelect.value = detected;
            renderMappingSelectors();
        };
        reader.readAsArrayBuffer(file);
    }

    function handleJsonExpenseFile(file) {
        if (!file || file.type !== 'application/json' && !file.name.endsWith('.json')) {
            alert('Selecciona un archivo JSON válido.');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            handleJsonExpensesText(e.target.result);
        };
        reader.readAsText(file);
    }

    function showJsonExpensesModal() {
        if (importJsonExpensesModal) showElement(importJsonExpensesModal, 'flex');
    }

    function closeJsonExpensesModal() {
        if (importJsonExpensesModal) hideElement(importJsonExpensesModal);
        parsedJsonExpenses = [];
        if (jsonExpensesPreview) jsonExpensesPreview.innerHTML = '';
    }

    function parseBankJsonDate(val) {
        if (!val || typeof val !== 'string') return null;
        const [mm, dd, yyyy] = val.split('/').map(part => parseInt(part, 10));
        if (!mm || !dd || !yyyy) return null;
        return new Date(Date.UTC(yyyy, mm - 1, dd));
    }

    function mapJsonTransactionsToExpenses(obj) {
        const results = [];
        if (!obj || typeof obj !== 'object') return results;
        const seen = new Set();
        const fromDate = parseBankJsonDate(obj.FromDate || obj.fromDate) || toUTCDate(obj.FromDate || obj.fromDate, null);
        const toDate = parseBankJsonDate(obj.ToDate || obj.toDate) || toUTCDate(obj.ToDate || obj.toDate, null);
        lastImportedJsonRange = (fromDate || toDate) ? { from: fromDate, to: toDate } : null;
        const buildExpenseFromPosted = (tx) => {
            if (!tx) return null;
            const originalDescription = (tx.Description || tx.description || '').trim();
            const description = normalizeFirebaseKeyText(originalDescription);
            const dateVal = tx.Date || tx.date;
            const dateObj = parseBankJsonDate(dateVal) || toUTCDate(dateVal, null);
            if (!description || !dateObj) return null;
            const withdrawal = parseAmountOrNull(tx.Withdrawal ?? tx.withdrawal);
            if (withdrawal === null || isNaN(withdrawal) || withdrawal === 0) return null;
            const amount = Math.abs(withdrawal);
            const dateStr = getISODateString(dateObj);
            const key = `${description}|${dateStr}|${amount}`;
            if (seen.has(key)) return null;
            seen.add(key);
            return {
                id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `tx-${Date.now()}-${Math.random().toString(16).slice(2)}`,
                date: dateObj,
                description,
                originalDescription,
                amount,
                currency: 'USD',
                sourceType: tx.Type || tx.type || 'POSTED',
                isPending: false,
                checkNumber: tx.CheckNumber ?? tx.checkNumber ?? undefined,
                balanceAfter: undefined,
                raw: tx
            };
        };
        (obj.PostedTransactions || []).forEach(tx => {
            const mapped = buildExpenseFromPosted(tx);
            if (mapped) results.push(mapped);
        });
        return results;
    }

    function renderJsonExpensesPreview() {
        if (!jsonExpensesPreview) return;
        jsonExpensesPreview.innerHTML = '';
        if (!parsedJsonExpenses.length) {
            jsonExpensesPreview.textContent = 'Sin datos para previsualizar.';
            return;
        }
        const categories = currentBackupData.expense_categories
            ? Object.keys(currentBackupData.expense_categories).filter(isFirebaseKeySafe).sort()
            : [];
        if (lastImportedJsonRange && (lastImportedJsonRange.from || lastImportedJsonRange.to)) {
            const rangeNotice = document.createElement('p');
            const fromStr = lastImportedJsonRange.from ? getISODateString(lastImportedJsonRange.from) : '¿?';
            const toStr = lastImportedJsonRange.to ? getISODateString(lastImportedJsonRange.to) : '¿?';
            rangeNotice.classList.add('json-range-notice');
            rangeNotice.textContent = `Rango sincronizado: ${fromStr} a ${toStr}`;
            jsonExpensesPreview.appendChild(rangeNotice);
        }
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th>Fecha</th><th>Descripción</th><th>Monto</th><th>Categoría</th><th>Tipo</th><th>Duplicado</th></tr>';
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        parsedJsonExpenses.forEach((item, idx) => {
            const dateStr = getISODateString(item.date);
            const isDup = checkExpenseDuplicate(item.description, dateStr, item.amount);
            const row = document.createElement('tr');
            if (isDup) row.classList.add('duplicate-row');
            row.insertCell().textContent = dateStr;
            row.insertCell().textContent = item.originalDescription || item.description;
            const amountCell = row.insertCell();
            amountCell.textContent = item.amount === null ? 'Pendiente sin monto' : formatAmountWithCurrency(item.amount, item.currency || 'USD');
            const catCell = row.insertCell();
            const select = document.createElement('select');
            select.dataset.index = idx;
            const emptyOpt = document.createElement('option');
            emptyOpt.value = '';
            emptyOpt.textContent = 'Seleccionar categoría';
            select.appendChild(emptyOpt);
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                select.appendChild(opt);
            });
            catCell.appendChild(select);
            row.insertCell().textContent = item.sourceType || '';
            row.insertCell().textContent = isDup ? 'Sí' : 'No';
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        jsonExpensesPreview.appendChild(table);
    }

    function handleJsonExpensesText(text) {
        if (jsonExpensesPreview) jsonExpensesPreview.innerHTML = '';
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (err) {
            jsonExpensesPreview.textContent = 'JSON inválido: ' + err.message;
            parsedJsonExpenses = [];
            showJsonExpensesModal();
            return;
        }
        parsedJsonExpenses = mapJsonTransactionsToExpenses(parsed);
        if (!parsedJsonExpenses.length) {
            jsonExpensesPreview.textContent = 'No se encontraron movimientos con descripción, fecha y monto.';
            showJsonExpensesModal();
            return;
        }
        renderJsonExpensesPreview();
        showJsonExpensesModal();
    }

    function addJsonExpenses() {
        if (!parsedJsonExpenses.length) { alert('Primero arrastra un JSON válido en la pestaña Gastos.'); return; }
        if (!currentBackupData.expenses) currentBackupData.expenses = [];
        let added = 0, skipped = 0, missingCategory = 0, missingAmount = 0;
        parsedJsonExpenses.forEach((item, idx) => {
            if (item.amount === null || isNaN(item.amount)) { missingAmount++; return; }
            const select = jsonExpensesPreview ? jsonExpensesPreview.querySelector(`select[data-index="${idx}"]`) : null;
            const category = select ? select.value : '';
            if (!category) { missingCategory++; return; }
            const dateStr = getISODateString(item.date);
            const isDup = checkExpenseDuplicate(item.description, dateStr, item.amount);
            if (isDup) { skipped++; return; }
            const expense = {
                name: item.description,
                amount: item.amount,
                currency: item.currency || 'USD',
                category,
                type: currentBackupData.expense_categories ? currentBackupData.expense_categories[category] || 'Variable' : 'Variable',
                frequency: 'Único',
                start_date: item.date,
                end_date: null,
                is_real: true,
                movement_date: item.date,
                payment_method: 'Efectivo / Debito',
                credit_card: null,
                installments: 1,
                bank_source_type: item.sourceType,
                bank_check_number: item.checkNumber,
                bank_balance_after: item.balanceAfter,
                bank_transaction_id: item.id,
                bank_raw: item.raw
            };
            expense.bank_original_description = item.originalDescription || item.description;
            currentBackupData.expenses.push(expense);
            added++;
        });
        if (lastImportedJsonRange) {
            currentBackupData.bank_import_ranges = currentBackupData.bank_import_ranges || [];
            const rangeKey = `${lastImportedJsonRange.from ? getISODateString(lastImportedJsonRange.from) : ''}|${lastImportedJsonRange.to ? getISODateString(lastImportedJsonRange.to) : ''}`;
            if (!currentBackupData.bank_import_ranges.some(r => `${r.from}|${r.to}` === rangeKey)) {
                currentBackupData.bank_import_ranges.push({
                    from: lastImportedJsonRange.from ? getISODateString(lastImportedJsonRange.from) : '',
                    to: lastImportedJsonRange.to ? getISODateString(lastImportedJsonRange.to) : '',
                    imported_at: new Date().toISOString()
                });
            }
        }
        renderExpensesTable();
        renderCashflowTable();
        alert(`Gastos agregados: ${added}. Duplicados omitidos: ${skipped}. Sin categoría: ${missingCategory}. Pendientes sin monto: ${missingAmount}.`);
        closeJsonExpensesModal();
    }

    openImportExpensesButtons.forEach(btn => btn.addEventListener("click", showImportExpensesModal));
    if (importExpensesModalClose) importExpensesModalClose.addEventListener('click', closeImportExpensesModal);
    if (importExpensesModal) importExpensesModal.addEventListener('click', (e)=>{ if(e.target===importExpensesModal) closeImportExpensesModal(); });
    if (importJsonExpensesClose) importJsonExpensesClose.addEventListener('click', closeJsonExpensesModal);
    if (importJsonExpensesModal) importJsonExpensesModal.addEventListener('click', (e)=>{ if (e.target === importJsonExpensesModal) closeJsonExpensesModal(); });
    if (addJsonExpensesButton) addJsonExpensesButton.addEventListener('click', addJsonExpenses);
    if (expenseDropZone) {
        expenseDropZone.addEventListener('click', () => { if(expenseFileInput) expenseFileInput.click(); });
        expenseDropZone.addEventListener('dragover', e => { e.preventDefault(); expenseDropZone.classList.add('dragover'); });
        expenseDropZone.addEventListener('dragleave', () => expenseDropZone.classList.remove('dragover'));
        expenseDropZone.addEventListener('drop', e => { e.preventDefault(); expenseDropZone.classList.remove('dragover'); if (e.dataTransfer.files[0]) handleExpenseFile(e.dataTransfer.files[0]); });
    }
    if (expenseFileInput) expenseFileInput.addEventListener('change', e => { if (e.target.files[0]) handleExpenseFile(e.target.files[0]); });
    if (expenseJsonDropZone) {
        expenseJsonDropZone.addEventListener('click', () => { if (expenseJsonFileInput) expenseJsonFileInput.click(); });
        expenseJsonDropZone.addEventListener('dragover', e => { e.preventDefault(); expenseJsonDropZone.classList.add('dragover'); });
        expenseJsonDropZone.addEventListener('dragleave', () => expenseJsonDropZone.classList.remove('dragover'));
        expenseJsonDropZone.addEventListener('drop', e => {
            e.preventDefault();
            expenseJsonDropZone.classList.remove('dragover');
            if (e.dataTransfer.files[0]) handleJsonExpenseFile(e.dataTransfer.files[0]);
        });
    }
    if (expenseJsonFileInput) expenseJsonFileInput.addEventListener('change', e => { if (e.target.files[0]) handleJsonExpenseFile(e.target.files[0]); });
    if (mapDateSelect) mapDateSelect.addEventListener('change', renderImportTable);
    if (mapDescSelect) mapDescSelect.addEventListener('change', renderImportTable);
    if (mapAmountSelect) mapAmountSelect.addEventListener('change', renderImportTable);
    if (bankProfileSelect) bankProfileSelect.addEventListener('change', () => applyBankProfile(bankProfileSelect.value));
    if (mergeExpensesButton) mergeExpensesButton.addEventListener('click', () => {
        const dateCol = mapDateSelect.value;
        const descCol = mapDescSelect.value;
        const amountCol = mapAmountSelect.value;
        if (!dateCol || !descCol || !amountCol) { alert('Mapea las columnas requeridas'); return; }
        const checkboxes = importTableContainer ? importTableContainer.querySelectorAll('input[type="checkbox"][data-index]') : [];
        checkboxes.forEach(chk => {
            if (chk.checked) {
                const idx = parseInt(chk.dataset.index,10);
                const row = parsedImportData[idx];
                const dateObj = parseExcelDate(row[dateCol]);
                const desc = row[descCol] !== undefined ? String(row[descCol]) : '';
                const amt = parseFloat(row[amountCol] || 0);
                const catSel = importTableContainer.querySelector(`select[data-index="${idx}"]`);
                const cat = catSel ? catSel.value : '';
                const entry = { name: desc, amount: amt, category: cat, type: currentBackupData.expense_categories[cat] || 'Variable', frequency: 'Único', start_date: dateObj, end_date: null, is_real: true, movement_date: dateObj, payment_method: 'Efectivo / Debito', credit_card: null, installments: 1 };
                if (!currentBackupData.expenses) currentBackupData.expenses = [];
                currentBackupData.expenses.push(entry);
            }
        });
        renderExpensesTable();
        renderCashflowTable();
        closeImportExpensesModal();
    });

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
        renderBudgetsTable(); renderBudgetSummaryTableForSelectedPeriod(); renderCashflowTable();
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
        const viewDate = currentBudgetViewDate instanceof Date ? currentBudgetViewDate : new Date();
        const periodDates = cashflowPeriodDatesMap["Mensual"] || [];
        const catTotals = cashflowCategoryTotalsMap["Mensual"] || [];
        let monthIdx = -1;
        for (let i = 0; i < periodDates.length; i++) {
            const d = periodDates[i];
            if (d.getUTCFullYear() === viewDate.getUTCFullYear() && d.getUTCMonth() === viewDate.getUTCMonth()) {
                monthIdx = i;
                break;
            }
        }
        const expensesThisMonth = monthIdx >= 0 ? (catTotals[monthIdx] || {}) : {};


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

    function setupBudgetPeriodSelectors() {
        const today = new Date();
        const analysisStartDate = (currentBackupData && currentBackupData.analysis_start_date)
            ? new Date(currentBackupData.analysis_start_date)
            : new Date(today);
        currentBudgetViewDate = today;
        const analysisEndDate = addMonths(new Date(analysisStartDate), (currentBackupData ? currentBackupData.analysis_duration : 12));
        if (budgetYearSelect) {
            budgetYearSelect.innerHTML = '';
            const startYear = Math.min(analysisStartDate.getUTCFullYear(), new Date().getUTCFullYear()) - 2;
            const endYear = Math.max(analysisEndDate.getUTCFullYear(), new Date().getUTCFullYear()) + 5;
            for (let y = startYear; y <= endYear; y++) {
                const option = document.createElement('option');
                option.value = y; option.textContent = y; budgetYearSelect.appendChild(option);
            }
            budgetYearSelect.value = currentBudgetViewDate.getUTCFullYear();
        }
        if (budgetMonthSelect) {
            budgetMonthSelect.innerHTML = '';
            MONTH_NAMES_FULL_ES.forEach((monthName, index) => {
                const option = document.createElement('option');
                option.value = index; option.textContent = monthName; budgetMonthSelect.appendChild(option);
            });
            budgetMonthSelect.value = currentBudgetViewDate.getUTCMonth();
        }
        [budgetYearSelect, budgetMonthSelect].forEach(sel => {
            if (!sel) return;
            sel.removeEventListener('change', renderBudgetSummaryTableForSelectedPeriod);
            sel.addEventListener('change', renderBudgetSummaryTableForSelectedPeriod);
        });
    }

    function navigateBudgetPeriod(direction) {
        let year = parseInt(budgetYearSelect.value);
        let month = parseInt(budgetMonthSelect.value);
        const newDate = new Date(Date.UTC(year, month, 15));
        newDate.setUTCMonth(newDate.getUTCMonth() + direction);
        budgetYearSelect.value = newDate.getUTCFullYear();
        budgetMonthSelect.value = newDate.getUTCMonth();
        renderBudgetSummaryTableForSelectedPeriod();
    }

    function renderBudgetSummaryTableForSelectedPeriod() {
        const year = parseInt(budgetYearSelect.value);
        const monthIndex = parseInt(budgetMonthSelect.value);
        currentBudgetViewDate = new Date(Date.UTC(year, monthIndex, 1));
        renderBudgetSummaryTable();
    }

    if (budgetPrevPeriodButton) budgetPrevPeriodButton.addEventListener('click', () => navigateBudgetPeriod(-1));
    if (budgetNextPeriodButton) budgetNextPeriodButton.addEventListener('click', () => navigateBudgetPeriod(1));

    // --- LÓGICA PESTAÑA REGISTRO PAGOS ---
    function setupPaymentPeriodSelectors() {
        const today = new Date();
        const analysisStartDate = (currentBackupData && currentBackupData.analysis_start_date)
            ? new Date(currentBackupData.analysis_start_date)
            : new Date(today);
        currentPaymentViewDate = today;
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
        const isWeekly = activePaymentsPeriodicity === "Semanal";
        paymentsTabTitle.textContent = isWeekly ? "Registro de Pagos Semanales" : "Registro de Pagos Mensuales";
        setElementDisplay(paymentMonthSelect, isWeekly ? 'none' : 'inline-block');
        setElementDisplay(paymentWeekSelect, isWeekly ? 'inline-block' : 'none');
    }
    prevPeriodButton.addEventListener('click', () => navigatePaymentPeriod(-1));
    nextPeriodButton.addEventListener('click', () => navigatePaymentPeriod(1));
    function navigatePaymentPeriod(direction) {
        const isWeekly = activePaymentsPeriodicity === "Semanal";
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
        if (!paymentsTableView || !currentBackupData || !currentBackupData.expenses) { if (paymentsTableView) paymentsTableView.innerHTML = '<tr><td colspan="7">No hay datos de gastos.</td></tr>'; return; }
        updatePaymentPeriodSelectorVisibility();
        const isWeeklyView = activePaymentsPeriodicity === "Semanal";
        const year = parseInt(paymentYearSelect.value);
        let periodStart, periodEnd;
        if (isWeeklyView) {
            const week = parseInt(paymentWeekSelect.value);
            periodStart = getMondayOfWeek(year, week); periodEnd = addWeeks(new Date(periodStart), 1); periodEnd.setUTCDate(periodEnd.getUTCDate() - 1);
        } else {
            const monthIndex = parseInt(paymentMonthSelect.value);
            periodStart = new Date(Date.UTC(year, monthIndex, 1)); periodEnd = new Date(Date.UTC(year, monthIndex + 1, 0));
        }
        currentPaymentViewDate = periodStart;
        paymentsTableView.innerHTML = '';
        let rowsData = [];
        currentBackupData.expenses.forEach(expense => {
            const dates = getExpenseOccurrenceDatesInPeriod(expense, periodStart, periodEnd, currentBackupData.use_instant_expenses);
            dates.forEach(occDate => {
                rowsData.push({
                    name: expense.name,
                    amount: (expense.installments && expense.installments > 1 && !currentBackupData.use_instant_expenses) ? expense.amount / expense.installments : expense.amount,
                    category: expense.category,
                    type: currentBackupData.expense_categories[expense.category] || 'Variable',
                    isReal: expense.is_real ? 'Sí' : 'No',
                    date: getISODateString(occDate),
                    paymentKey: `${expense.name}|${getISODateString(occDate)}`,
                    currency: expense.currency
                });
            });
        });
        rowsData.sort((a, b) => a.category.localeCompare(b.category, undefined, { sensitivity: 'base' }));
        rowsData.forEach(r => {
            const row = paymentsTableView.insertRow();
            row.insertCell().textContent = r.name;
            row.insertCell().textContent = formatAmountWithCurrency(r.amount, r.currency);
            row.insertCell().textContent = r.category;
            row.insertCell().textContent = r.type;
            row.insertCell().textContent = r.isReal;
            row.insertCell().textContent = r.date;
            const paidCell = row.insertCell();
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = currentBackupData.payments && currentBackupData.payments[r.paymentKey] === true;
            checkbox.dataset.paymentKey = r.paymentKey;
            checkbox.addEventListener('change', (e) => {
                if (!currentBackupData.payments) currentBackupData.payments = {};
                currentBackupData.payments[e.target.dataset.paymentKey] = e.target.checked;
            });
            paidCell.appendChild(checkbox);
        });
        const expensesInPeriodFound = rowsData.length > 0;
        if (!expensesInPeriodFound) {
            const row = paymentsTableView.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 7;
            cell.textContent = "No hay gastos programados para este período.";
            cell.style.textAlign = "center";
        }
    }

    // --- LÓGICA PESTAÑA FLUJO DE CAJA ---
    async function renderCashflowTable() {
        try {
            updateAnalysisModeLabels();
            await renderCashflowTableFor('Mensual', cashflowMensualTableHead, cashflowMensualTableBody, cashflowMensualTitle);
            await renderCashflowTableFor('Semanal', cashflowSemanalTableHead, cashflowSemanalTableBody, cashflowSemanalTitle);
            await renderCashflowTableFor('Diario', cashflowDiarioTableHead, cashflowDiarioTableBody, cashflowDiarioTitle);
        } catch (error) {
            console.error('Error al renderizar el flujo de caja:', error);
        }
    }

    async function renderCashflowTableFor(periodicity, tableHeadEl, tableBodyEl, titleEl) {
        if (!currentBackupData || !tableBodyEl || !tableHeadEl) return;
        tableHeadEl.innerHTML = '';
        tableBodyEl.innerHTML = '';

        let baseStartDate = currentBackupData.analysis_start_date;
        if (typeof baseStartDate === 'string') baseStartDate = toUTCDate(baseStartDate);
        if (!(baseStartDate instanceof Date) || isNaN(baseStartDate)) {
            tableBodyEl.innerHTML = '<tr><td colspan="2">Error: Fecha de inicio inválida.</td></tr>';
            return;
        }

        const monthStart = new Date(Date.UTC(baseStartDate.getUTCFullYear(), baseStartDate.getUTCMonth(), 1));
        let analysisStart = monthStart;
        let duration = currentBackupData.analysis_duration;

        if (periodicity === 'Semanal') {
            analysisStart = getPeriodStartDate(monthStart, 'Semanal');
            const endOfLastMonth = getPeriodEndDate(addMonths(monthStart, duration - 1), 'Mensual');
            duration = 0; let d = new Date(analysisStart);
            while (d <= endOfLastMonth) { duration++; d = addWeeks(d, 1); }
        } else if (periodicity === 'Diario') {
            analysisStart = getPeriodStartDate(monthStart, 'Diario');
            const endOfLastMonth = getPeriodEndDate(addMonths(monthStart, duration - 1), 'Mensual');
            duration = 0; let d = new Date(analysisStart);
            while (d <= endOfLastMonth) { duration++; d = addDays(d, 1); }
        }

        const tempCalcData = {
            ...currentBackupData,
            analysis_start_date: analysisStart,
            analysis_duration: duration,
            analysis_periodicity: periodicity,
            incomes: (currentBackupData.incomes || []).map(inc => ({
                ...inc,
                start_date: inc.start_date ? new Date(inc.start_date) : null,
                end_date: inc.end_date ? new Date(inc.end_date) : null
            })),
            expenses: (currentBackupData.expenses || []).map(exp => ({
                ...exp,
                start_date: exp.start_date ? new Date(exp.start_date) : null,
                end_date: exp.end_date ? new Date(exp.end_date) : null
            }))
        };

        const rateDateCandidates = [];
        let periodCursor = new Date(analysisStart.getTime());
        for (let i = 0; i < duration; i++) {
            const periodStart = getPeriodStartDate(periodCursor, periodicity);
            const periodEnd = getPeriodEndDate(periodCursor, periodicity);
            rateDateCandidates.push(
                ...collectUsdRateDatesForExpenses(tempCalcData.expenses, periodStart, periodEnd, tempCalcData.use_instant_expenses)
            );
            rateDateCandidates.push(
                ...collectUsdRateDatesForIncomes(tempCalcData.incomes, periodStart, periodEnd, periodicity)
            );
            periodCursor = advancePeriodStart(periodStart, periodicity);
        }

        await ensureUsdClpRatesForDates(rateDateCandidates);

        const { periodDates, income_p, fixed_exp_p, var_exp_p, net_flow_p, end_bal_p, expenses_by_cat_p } = calculateCashFlowData(tempCalcData);
        cashflowPeriodDatesMap[periodicity] = periodDates;
        cashflowCategoryTotalsMap[periodicity] = expenses_by_cat_p;

        if (!periodDates || periodDates.length === 0) {
            tableBodyEl.innerHTML = '<tr><td colspan="2">No hay datos para el período.</td></tr>';
            if (cashflowChartInstance && periodicity === activeCashflowPeriodicity) {
                cashflowChartInstance.destroy();
                cashflowChartInstance = null;
            }
            if (chartMessage && periodicity === activeCashflowPeriodicity) chartMessage.textContent = "No hay datos para graficar.";
            return;
        }

        const symbol = currentBackupData.display_currency_symbol || "$";
        const initialBalance = parseFloat(currentBackupData.analysis_initial_balance);
        const startQDate = analysisStart;
        const startStr = `${('0' + startQDate.getUTCDate()).slice(-2)}/${('0' + (startQDate.getUTCMonth() + 1)).slice(-2)}/${startQDate.getUTCFullYear()}`;
        titleEl.textContent = `Proyección Flujo de Caja ${periodicity} (${currentBackupData.analysis_duration} Meses desde ${startStr})`;

        const headerRow = tableHeadEl.insertRow();
        const thConcept = document.createElement('th');
        thConcept.textContent = 'Categoría / Concepto';
        headerRow.appendChild(thConcept);

        periodDates.forEach(d => {
            const th = document.createElement('th');
            if (periodicity === 'Semanal') {
                const [year, week] = getWeekNumber(d);
                const mondayOfWeek = getMondayOfWeek(year, week);
                th.innerHTML = `Sem ${week} (${DATE_WEEK_START_FORMAT(mondayOfWeek)})<br>${year}`;
            } else if (periodicity === 'Diario') {
                th.innerHTML = `${DATE_DAY_FORMAT(d)}<br>${d.getUTCFullYear()}`;
            } else {
                th.innerHTML = `${MONTH_NAMES_ES[d.getUTCMonth()]}<br>${d.getUTCFullYear()}`;
            }
            headerRow.appendChild(th);
        });

        const cf_row_definitions = [
            { key: 'START_BALANCE', label: 'Saldo Inicial', isBold: true, isHeaderBg: true },
            { key: 'NET_INCOME', label: 'Ingreso Total Neto', isBold: true }
        ];
        const fixedCategories = currentBackupData.expense_categories ? Object.keys(currentBackupData.expense_categories).filter(cat => currentBackupData.expense_categories[cat] === 'Fijo').sort() : [];
        const variableCategories = currentBackupData.expense_categories ? Object.keys(currentBackupData.expense_categories).filter(cat => currentBackupData.expense_categories[cat] === 'Variable').sort() : [];
        fixedCategories.forEach(cat => cf_row_definitions.push({ key: `CAT_${cat}`, label: cat, isIndent: true, category: cat }));
        cf_row_definitions.push({ key: 'FIXED_EXP_TOTAL', label: 'Total Gastos Fijos', isBold: true, isHeaderBg: true });
        variableCategories.forEach(cat => cf_row_definitions.push({ key: `CAT_${cat}`, label: cat, isIndent: true, category: cat }));
        cf_row_definitions.push({ key: 'VAR_EXP_TOTAL', label: 'Total Gastos Variables', isBold: true, isHeaderBg: true });
        cf_row_definitions.push({ key: 'NET_FLOW', label: 'Flujo Neto del Período', isBold: true });
        cf_row_definitions.push({ key: 'END_BALANCE', label: 'Saldo Final Estimado', isBold: true, isHeaderBg: true });

        cf_row_definitions.forEach((def, rowIndex) => {
            const tr = tableBodyEl.insertRow();
            const tdLabel = tr.insertCell();
            tdLabel.textContent = def.isIndent ? `  ${def.label}` : def.label;
            if (def.isBold) tdLabel.classList.add('bold');
            if (def.isHeaderBg) tr.classList.add('bg-header');
            else if (rowIndex % 2 !== 0 && !def.isHeaderBg) tr.classList.add('bg-alt-row');

            for (let i = 0; i < periodDates.length; i++) {
                const tdValue = tr.insertCell();
                let value; let colorClass = '';
                switch (def.key) {
                    case 'START_BALANCE':
                        value = (i === 0) ? initialBalance : end_bal_p[i - 1];
                        break;
                    case 'NET_INCOME':
                        value = income_p[i];
                        break;
                    case 'FIXED_EXP_TOTAL':
                        value = -fixed_exp_p[i];
                        break;
                    case 'VAR_EXP_TOTAL':
                        value = -var_exp_p[i];
                        break;
                    case 'NET_FLOW':
                        value = net_flow_p[i];
                        break;
                    case 'END_BALANCE':
                        value = end_bal_p[i];
                        colorClass = value >= 0 ? 'text-blue' : 'text-red';
                        break;
                    default:
                        value = (def.category && expenses_by_cat_p[i]) ? -(expenses_by_cat_p[i][def.category] || 0) : 0;
                }
                tdValue.textContent = formatCurrencyJS(value, symbol);
                tdValue.dataset.periodicity = periodicity;
                tdValue.dataset.periodIndex = i;
                tdValue.dataset.rowKey = def.key;
                if (def.category) tdValue.dataset.category = def.category;
                if (colorClass) tdValue.classList.add(colorClass);
                if (def.isBold) tdValue.classList.add('bold');
            }
        });

        highlightCurrentPeriodColumn(periodicity, tableHeadEl, tableBodyEl, periodDates);
        attachCashflowCellListeners(tableBodyEl);

        if (periodicity === activeCashflowPeriodicity) {
            renderCashflowChart(periodDates, income_p, fixed_exp_p.map((val, idx) => val + var_exp_p[idx]), net_flow_p, end_bal_p);
        }

        renderBudgetSummaryTableForSelectedPeriod();
    }

    function buildExpenseOccurrenceContext(expense, useInstant) {
        if (!expense) return { normalizedExpense: expense, amountPerOccurrence: 0 };
        const baseStart = useInstant && expense.movement_date ? new Date(expense.movement_date) : (expense.start_date ? new Date(expense.start_date) : null);
        if (!baseStart) return { normalizedExpense: expense, amountPerOccurrence: 0 };
        let start = baseStart;
        let end = expense.end_date ? new Date(expense.end_date) : null;
        if (useInstant && expense.end_date && expense.movement_date) {
            const diff = new Date(expense.start_date).getTime() - new Date(expense.movement_date).getTime();
            end = new Date(new Date(expense.end_date).getTime() - diff);
        }
        let amountPerOccurrence = parseFloat(expense.amount || 0);
        const installments = parseInt(expense.installments || 1, 10);
        let frequency = expense.frequency || 'Mensual';
        if (installments > 1 && !useInstant) {
            frequency = 'Mensual';
            amountPerOccurrence = amountPerOccurrence / installments;
            end = addMonths(new Date(start), installments - 1);
        }
        const normalizedExpense = { ...expense, start_date: start, end_date: end, frequency };
        return { normalizedExpense, amountPerOccurrence: isNaN(amountPerOccurrence) ? 0 : amountPerOccurrence };
    }

    function getIncomeOccurrenceDatesInPeriod(income, pStart, pEnd, periodicity) {
        if (!income || !income.start_date || !(pStart instanceof Date) || !(pEnd instanceof Date) || pStart > pEnd) return [];
        const start = new Date(income.start_date);
        const end = income.end_date ? new Date(income.end_date) : null;
        const freq = income.frequency || 'Mensual';
        const dates = [];

        if (freq === 'Único') {
            if (start >= pStart && start <= pEnd) dates.push(new Date(start));
        } else if (freq === 'Mensual') {
            if (start > pEnd || (end && end < pStart)) return [];
            const payDay = start.getUTCDate();
            const monthsToCheck = new Set();
            let iter = new Date(Date.UTC(pStart.getUTCFullYear(), pStart.getUTCMonth(), 1));
            while (iter <= pEnd) {
                monthsToCheck.add(`${iter.getUTCFullYear()}-${iter.getUTCMonth()}`);
                iter.setUTCMonth(iter.getUTCMonth() + 1);
            }
            monthsToCheck.forEach(key => {
                const [y, m] = key.split('-').map(n => parseInt(n, 10));
                const daysInMonth = getDaysInMonth(y, m);
                const payDate = new Date(Date.UTC(y, m, Math.min(payDay, daysInMonth)));
                if (payDate >= pStart && payDate <= pEnd && payDate >= start && (!end || payDate <= end)) {
                    dates.push(payDate);
                }
            });
        } else if (freq === 'Semanal') {
            if (start > pEnd || (end && end < pStart)) return [];
            const payDow = start.getUTCDay();
            let d = new Date(pStart.getTime());
            while (d <= pEnd) {
                if (d.getUTCDay() === payDow && d >= start && (!end || d <= end)) dates.push(new Date(d));
                d.setUTCDate(d.getUTCDate() + 1);
            }
        } else if (freq === 'Bi-semanal') {
            if (start > pEnd || (end && end < pStart)) return [];
            let payDate = new Date(start.getTime());
            while (payDate < pStart) {
                payDate = addWeeks(payDate, 2);
                if (end && payDate > end) return dates;
            }
            while (payDate <= pEnd) {
                if (!end || payDate <= end) dates.push(new Date(payDate));
                payDate = addWeeks(payDate, 2);
            }
        }
        return dates;
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
            // const p_start = new Date(currentDate.getTime()); let p_end; // OLD LOGIC
            // if (periodicity === "Mensual") { p_end = addMonths(new Date(p_start.getTime()), 1); p_end.setUTCDate(p_end.getUTCDate() - 1); } else { p_end = addWeeks(new Date(p_start.getTime()), 1); p_end.setUTCDate(p_end.getUTCDate() - 1); }
            // periodDates.push(p_start); let p_inc_total = 0.0; // OLD LOGIC

            const p_start = getPeriodStartDate(currentDate, periodicity);
            const p_end = getPeriodEndDate(currentDate, periodicity);
            periodDates.push(p_start);
            let p_inc_total = 0.0;

                        (data.incomes || []).forEach(inc => {
                if (!inc.start_date || inc.is_reimbursement) return;
                const occurrenceDates = getIncomeOccurrenceDatesInPeriod(inc, p_start, p_end, periodicity);
                if (!occurrenceDates || occurrenceDates.length === 0) return;
                const netAmount = parseFloat(inc.net_monthly || 0);
                occurrenceDates.forEach(date => {
                    p_inc_total += convertAmountToUsd(netAmount, inc.currency, date);
                });
            });
            income_p[i] = p_inc_total;

                        let p_fix_exp_total_for_period = 0.0;
            let p_var_exp_total_for_period = 0.0;

            (data.expenses || []).forEach(exp => {
                if (!exp.start_date) return;
                const { normalizedExpense, amountPerOccurrence } = buildExpenseOccurrenceContext(exp, data.use_instant_expenses);
                if (!normalizedExpense.start_date) return;
                const typ = exp.type || (data.expense_categories && data.expense_categories[exp.category]) || "Variable";
                const cat = exp.category;
                if (!cat || !orderedCategories.includes(cat)) return;

                const occurrenceDates = getExpenseOccurrenceDatesInPeriod(normalizedExpense, p_start, p_end, data.use_instant_expenses);
                if (!occurrenceDates || occurrenceDates.length === 0) return;

                let expTotalForPeriod = 0.0;
                occurrenceDates.forEach(date => {
                    expTotalForPeriod += convertAmountToUsd(amountPerOccurrence, exp.currency, date);
                });

                if (expTotalForPeriod > 0) {
                    expenses_by_cat_p[i][cat] = (expenses_by_cat_p[i][cat] || 0) + expTotalForPeriod;
                }
            });

            (data.incomes || []).forEach(reimbInc => {
                if (!reimbInc.is_reimbursement || !reimbInc.reimbursement_category || !reimbInc.start_date) return;
                const occurrenceDates = getIncomeOccurrenceDatesInPeriod(reimbInc, p_start, p_end, periodicity);
                if (!occurrenceDates || occurrenceDates.length === 0) return;
                const reimbAmount = parseFloat(reimbInc.net_monthly || 0);
                let reimbursementTotal = 0.0;
                occurrenceDates.forEach(date => {
                    reimbursementTotal += convertAmountToUsd(reimbAmount, reimbInc.currency, date);
                });

                if (reimbursementTotal > 0 && expenses_by_cat_p[i][reimbInc.reimbursement_category] !== undefined) {
                    expenses_by_cat_p[i][reimbInc.reimbursement_category] = (expenses_by_cat_p[i][reimbInc.reimbursement_category] || 0) - reimbursementTotal;
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
            currentBalance = end_bal; currentDate = advancePeriodStart(currentDate, periodicity);
        }
        return { periodDates, income_p, fixed_exp_p, var_exp_p, net_flow_p, end_bal_p, expenses_by_cat_p };
    }

    // --- LÓGICA PESTAÑA GRÁFICO ---
    function formatChartPeriodLabel(date) {
        if (!(date instanceof Date)) return '';
        if (activeCashflowPeriodicity === 'Semanal') {
            const [year, week] = getWeekNumber(date);
            return `Sem ${week} ${year}`;
        }
        if (activeCashflowPeriodicity === 'Diario') {
            return `${DATE_DAY_FORMAT(date)} ${date.getUTCFullYear()}`;
        }
        return `${MONTH_NAMES_ES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
    }

    function updateChartKPIs(periodDates = [], incomes = [], totalExpenses = [], netFlows = [], endBalances = []) {
        const symbol = currentBackupData?.display_currency_symbol || '$';
        if (!chartKpiBalance || !chartKpiPeriod || !chartKpiAvgNet || !chartKpiMaxExpense || !chartKpiCoverage) return;
        if (!periodDates.length || !endBalances.length) {
            chartKpiBalance.textContent = '—';
            chartKpiPeriod.textContent = '—';
            if (chartKpiAvgNet) chartKpiAvgNet.textContent = '—';
            if (chartKpiAvgNetDetail) chartKpiAvgNetDetail.textContent = '—';
            if (chartKpiMaxExpense) chartKpiMaxExpense.textContent = '—';
            if (chartKpiMaxExpensePeriod) chartKpiMaxExpensePeriod.textContent = '—';
            chartKpiCoverage.textContent = '—';
            return;
        }
        const lastIdx = Math.max(0, endBalances.length - 1);
        const lastLabel = formatChartPeriodLabel(periodDates[lastIdx]);
        chartKpiBalance.textContent = formatCurrencyJS(endBalances[lastIdx], symbol);
        chartKpiPeriod.textContent = `Hasta ${lastLabel}`;

        if (chartKpiAvgNet) {
            const avgNet = netFlows.length ? netFlows.reduce((acc, n) => acc + n, 0) / netFlows.length : 0;
            chartKpiAvgNet.textContent = formatCurrencyJS(avgNet, symbol);
            if (chartKpiAvgNetDetail) chartKpiAvgNetDetail.textContent = `${netFlows.length} períodos ${activeCashflowPeriodicity.toLowerCase()}`;
        }

        if (chartKpiMaxExpense) {
            let maxExpense = -Infinity;
            let maxIdx = -1;
            totalExpenses.forEach((v, idx) => {
                if (v > maxExpense) {
                    maxExpense = v;
                    maxIdx = idx;
                }
            });
            if (maxIdx >= 0) {
                chartKpiMaxExpense.textContent = formatCurrencyJS(totalExpenses[maxIdx], symbol);
                if (chartKpiMaxExpensePeriod) chartKpiMaxExpensePeriod.textContent = formatChartPeriodLabel(periodDates[maxIdx]);
            } else {
                chartKpiMaxExpense.textContent = '—';
                if (chartKpiMaxExpensePeriod) chartKpiMaxExpensePeriod.textContent = '—';
            }
        }

        const avgExpense = totalExpenses.length ? totalExpenses.reduce((acc, n) => acc + n, 0) / totalExpenses.length : 0;
        const coverage = avgExpense !== 0 ? endBalances[lastIdx] / avgExpense : 0;
        chartKpiCoverage.textContent = isFinite(coverage) ? `${coverage.toFixed(1)}x` : '—';
    }

    function applyDatasetVisibilityFromToggles(shouldUpdate = true) {
        if (!cashflowChartInstance || !Array.isArray(cashflowChartInstance.data.datasets)) return;
        chartDatasetToggles.forEach(toggle => {
            const targetLabel = toggle.getAttribute('data-target');
            const dataset = cashflowChartInstance.data.datasets.find(ds => ds.label === targetLabel);
            if (dataset) dataset.hidden = !toggle.checked;
        });
        if (shouldUpdate) cashflowChartInstance.update();
    }

    function applyLineStylePreference(shouldUpdate = true) {
        if (!cashflowChartInstance || !Array.isArray(cashflowChartInstance.data.datasets)) return;
        const mode = chartLineStyleSelect ? chartLineStyleSelect.value : 'smooth';
        const balanceDataset = cashflowChartInstance.data.datasets[0];
        if (balanceDataset) {
            balanceDataset.stepped = mode === 'stepped';
            balanceDataset.tension = mode === 'smooth' ? 0.35 : 0;
        }
        if (shouldUpdate) cashflowChartInstance.update();
    }

    function exportChartAsImage() {
        if (!cashflowChartInstance) return;
        const url = cashflowChartInstance.toBase64Image('image/png', 1);
        if (!url) return;
        const link = document.createElement('a');
        link.href = url;
        link.download = `flujo-caja-${activeCashflowPeriodicity.toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    function renderCashflowChart(periodDates, incomes, totalExpenses, netFlows, endBalances, storeData = true) {
        if (storeData) {
            fullChartData = { periodDates, incomes, totalExpenses, netFlows, endBalances };
            if (mobileChartStartInput && mobileChartEndInput && periodDates.length > 0) {
                mobileChartStartInput.value = getISODateString(periodDates[0]);
                mobileChartEndInput.value = getISODateString(periodDates[periodDates.length - 1]);
            }
        }
        if (!cashflowChartCanvas) return; if (cashflowChartInstance) cashflowChartInstance.destroy();
        if (!periodDates || periodDates.length === 0) { if (chartMessage) chartMessage.textContent = "El gráfico se generará después de calcular el flujo de caja."; return; }
        if (chartMessage) chartMessage.textContent = "";
        const labels = periodDates.map(date => {
            if (activeCashflowPeriodicity === 'Semanal') {
                const [year, week] = getWeekNumber(date);
                return `Sem ${week} ${year}`;
            }
            if (activeCashflowPeriodicity === 'Diario') {
                return `${DATE_DAY_FORMAT(date)} ${date.getUTCFullYear()}`;
            }
            return `${MONTH_NAMES_ES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
        });
        const currentPeriodIndex = findCurrentPeriodIndex(periodDates, activeCashflowPeriodicity);
        const xScaleOptions = { type: 'category' };
        if (currentPeriodIndex !== -1) {
            const lookaheadByPeriod = { Mensual: 6, Semanal: 16, Diario: 30 };
            const lookaheadCount = lookaheadByPeriod[activeCashflowPeriodicity] || 0;
            const minIndex = Math.max(0, currentPeriodIndex - 4);
            const maxIndex = Math.min(periodDates.length - 1, currentPeriodIndex + lookaheadCount);
            if (minIndex <= maxIndex) {
                xScaleOptions.min = labels[minIndex];
                xScaleOptions.max = labels[maxIndex];
            }
        }
        const currentPeriodHighlight = currentPeriodIndex !== -1 ? {
            linePointRadius: labels.map((_, idx) => idx === currentPeriodIndex ? 8 : 4),
            linePointHoverRadius: labels.map((_, idx) => idx === currentPeriodIndex ? 10 : 6),
            linePointBackground: labels.map((_, idx) => idx === currentPeriodIndex ? '#0d6efd' : 'rgba(54, 162, 235, 1)'),
            linePointBorder: labels.map((_, idx) => idx === currentPeriodIndex ? '#083b92' : 'rgba(54, 162, 235, 1)'),
            linePointBorderWidth: labels.map((_, idx) => idx === currentPeriodIndex ? 3 : 1.5),
            scatterRadius: labels.map((_, idx) => idx === currentPeriodIndex ? 8 : 6),
            scatterHoverRadius: labels.map((_, idx) => idx === currentPeriodIndex ? 10 : 8)
        } : null;
        const highlightCurrentPeriodPlugin = currentPeriodIndex !== -1 ? [{
            id: 'highlightCurrentPeriod',
            afterDatasetsDraw(chart, args, pluginOptions) {
                const { ctx, chartArea, scales } = chart;
                if (!chartArea || !scales || !scales.x) return;
                const index = pluginOptions?.currentIndex ?? -1;
                if (index < 0 || index >= chart.data.labels.length) return;
                const xScale = scales.x;
                const label = chart.data.labels[index];
                const xPos = typeof xScale.getPixelForValue === 'function'
                    ? xScale.getPixelForValue(label, index)
                    : xScale.getPixelForTick(index);
                if (!isFinite(xPos)) return;
                ctx.save();
                ctx.setLineDash([6, 4]);
                ctx.lineWidth = 2;
                ctx.strokeStyle = pluginOptions?.color || 'rgba(13, 110, 253, 0.7)';
                ctx.beginPath();
                ctx.moveTo(xPos, chartArea.top);
                ctx.lineTo(xPos, chartArea.bottom);
                ctx.stroke();
                ctx.restore();
            }
        }] : [];
        cashflowChartInstance = new Chart(cashflowChartCanvas, {
            type: 'line',
            data: { labels: labels, datasets: [{ label: 'Saldo Final Estimado', data: endBalances, borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)', tension: 0.1, fill: false, pointRadius: 4, pointBackgroundColor: 'rgba(54, 162, 235, 1)', borderWidth: 2, order: 1, }, { label: 'Ingreso Total Neto', data: incomes, borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 1)', type: 'scatter', showLine: false, pointRadius: 6, pointStyle: 'circle', order: 2, }, { label: 'Gasto Total', data: totalExpenses.map(e => -e), borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 1)', type: 'scatter', showLine: false, pointRadius: 6, pointStyle: 'rectRot', order: 2, }, { label: 'Flujo Neto del Período', data: netFlows, borderColor: 'rgba(255, 206, 86, 1)', backgroundColor: 'rgba(255, 206, 86, 1)', type: 'scatter', showLine: false, pointRadius: 6, pointStyle: 'triangle', order: 2, }] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: xScaleOptions,
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: `Saldo / Flujos (${currentBackupData.display_currency_symbol || '$'})` }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                if (context.parsed.y !== null) label += formatCurrencyJS(context.parsed.y, currentBackupData.display_currency_symbol || '$');
                                return label;
                            }
                        }
                    },
                    legend: { position: 'top' },
                    zoom: {
                        pan: {
                            enabled: isTouchDevice ? true : chartZoomMode,
                            mode: 'xy',
                            modifierKey: isTouchDevice ? null : 'ctrl',
                        },
                        zoom: {
                            wheel: {
                                enabled: isTouchDevice ? false : chartZoomMode,
                            },
                            pinch: {
                                enabled: isTouchDevice ? true : chartZoomMode
                            },
                            drag: {
                                enabled: isTouchDevice ? false : chartZoomMode,
                                backgroundColor: 'rgba(0,123,255,0.25)'
                            },
                            mode: 'xy',
                        }
                    },
                    highlightCurrentPeriod: currentPeriodIndex !== -1 ? { currentIndex: currentPeriodIndex } : undefined
                }
            },
            plugins: highlightCurrentPeriodPlugin
        });
        applyLineStylePreference(false);
        applyDatasetVisibilityFromToggles(false);
        cashflowChartInstance.update();
        if (currentPeriodHighlight) {
            const [saldoDataset, ingresosDataset, gastosDataset, flujoDataset] = cashflowChartInstance.data.datasets;
            if (saldoDataset) {
                saldoDataset.pointRadius = currentPeriodHighlight.linePointRadius;
                saldoDataset.pointHoverRadius = currentPeriodHighlight.linePointHoverRadius;
                saldoDataset.pointBackgroundColor = currentPeriodHighlight.linePointBackground;
                saldoDataset.pointBorderColor = currentPeriodHighlight.linePointBorder;
                saldoDataset.pointBorderWidth = currentPeriodHighlight.linePointBorderWidth;
            }
            [ingresosDataset, gastosDataset, flujoDataset].forEach(dataset => {
                if (!dataset) return;
                dataset.pointRadius = currentPeriodHighlight.scatterRadius;
                dataset.pointHoverRadius = currentPeriodHighlight.scatterHoverRadius;
            });
            cashflowChartInstance.update();
        }
        updateChartKPIs(periodDates, incomes, totalExpenses, netFlows, endBalances);
        cashflowChartCanvas.onclick = async (evt) => {
            if (!cashflowChartInstance) return;
            const points = cashflowChartInstance.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
            if (points.length) {
                const idx = points[0].index;
                const rows = await gatherPeriodTransactions(periodDates[idx], activeCashflowPeriodicity);
                openChartModal(`Transacciones - ${labels[idx]}`, rows);
            }
        };
        if (isTouchDevice) {
            enableChartZoom();
            if (chartMessage) chartMessage.textContent = 'Usa dos dedos para hacer zoom y mover el gráfico. Doble tap fuera del gráfico para salir.';
        } else {
            if (cashflowChartCanvas) cashflowChartCanvas.style.cursor = 'zoom-in';
            if (chartMessage) chartMessage.textContent = 'Doble clic en el gráfico para activar el zoom.';
        }
    }

    function getExpenseOccurrencesInPeriod(expense, pStart, pEnd, periodicity, useInstant) {
        if (!expense || !expense.start_date || !(pStart instanceof Date) || !(pEnd instanceof Date) || pStart > pEnd) return 0;
        const baseStart = useInstant && expense.movement_date ? new Date(expense.movement_date) : new Date(expense.start_date);
        let start = baseStart;
        let end = expense.end_date ? new Date(expense.end_date) : null;
        if (useInstant && expense.end_date && expense.movement_date) {
            const diff = new Date(expense.start_date).getTime() - new Date(expense.movement_date).getTime();
            end = new Date(new Date(expense.end_date).getTime() - diff);
        }
        const installments = parseInt(expense.installments || 1);
        let freq = expense.frequency || 'Mensual';
        if (installments > 1 && !useInstant) {
            freq = 'Mensual';
            end = addMonths(new Date(start), installments - 1);
        }

        if (freq === 'Único') {
            return (start >= pStart && start <= pEnd) ? 1 : 0;
        } else if (freq === 'Mensual') {
            if (start > pEnd || (end && end < pStart)) return 0;
            const payDay = start.getUTCDate();
            if (periodicity === 'Semanal') {
                const candidates = [];
                const monthsToCheck = new Set([
                    `${pStart.getUTCFullYear()}-${pStart.getUTCMonth()}`,
                    `${pEnd.getUTCFullYear()}-${pEnd.getUTCMonth()}`
                ]);
                monthsToCheck.forEach(key => {
                    const [y,m] = key.split('-').map(n=>parseInt(n));
                    const daysInMonth = getDaysInMonth(y,m);
                    const d = new Date(Date.UTC(y, m, Math.min(payDay, daysInMonth)));
                    candidates.push(d);
                });
                for (const payDate of candidates) {
                    if (payDate >= pStart && payDate <= pEnd && start <= payDate && (!end || end >= payDate)) return 1;
                }
                return 0;
            } else {
                const year = pStart.getUTCFullYear();
                const month = pStart.getUTCMonth();
                const daysInMonth = getDaysInMonth(year, month);
                const payDate = new Date(Date.UTC(year, month, Math.min(payDay, daysInMonth)));
                return (payDate >= pStart && payDate <= pEnd && start <= payDate && (!end || end >= payDate)) ? 1 : 0;
            }
        } else if (freq === 'Semanal') {
            if (start > pEnd || (end && end < pStart)) return 0;
            if (periodicity === 'Semanal') {
                return 1;
            } else {
                let count = 0;
                const payDow = start.getUTCDay();
                let d = new Date(pStart.getTime());
                while (d <= pEnd) {
                    if (d.getUTCDay() === payDow && d >= start && (!end || d <= end)) count++;
                    d.setUTCDate(d.getUTCDate() + 1);
                }
                return count;
            }
        } else if (freq === 'Bi-semanal') {
            if (start > pEnd || (end && end < pStart)) return 0;
            let count = 0;
            let payDate = new Date(start.getTime());
            while (payDate < pStart) {
                payDate = addWeeks(payDate, 2);
                if (end && payDate > end) return count;
            }
            while (payDate <= pEnd) {
                if (!end || payDate <= end) count++;
                payDate = addWeeks(payDate, 2);
            }
            return count;
        }
        return 0;
    }

    function getExpenseOccurrenceDatesInPeriod(expense, pStart, pEnd, useInstant) {
        if (!expense || !expense.start_date || !(pStart instanceof Date) || !(pEnd instanceof Date) || pStart > pEnd) return [];
        const baseStart = useInstant && expense.movement_date ? new Date(expense.movement_date) : new Date(expense.start_date);
        let start = baseStart;
        let end = expense.end_date ? new Date(expense.end_date) : null;
        if (useInstant && expense.end_date && expense.movement_date) {
            const diff = new Date(expense.start_date).getTime() - new Date(expense.movement_date).getTime();
            end = new Date(new Date(expense.end_date).getTime() - diff);
        }
        const installments = parseInt(expense.installments || 1);
        let freq = expense.frequency || 'Mensual';
        if (installments > 1 && !useInstant) {
            freq = 'Mensual';
            end = addMonths(new Date(start), installments - 1);
        }

        const dates = [];

        if (freq === 'Único') {
            if (start >= pStart && start <= pEnd) dates.push(new Date(start));
        } else if (freq === 'Mensual') {
            if (start > pEnd || (end && end < pStart)) return [];
            const payDay = start.getUTCDate();
            const monthsToCheck = new Set();
            let iter = new Date(Date.UTC(pStart.getUTCFullYear(), pStart.getUTCMonth(), 1));
            while (iter <= pEnd) {
                monthsToCheck.add(`${iter.getUTCFullYear()}-${iter.getUTCMonth()}`);
                iter.setUTCMonth(iter.getUTCMonth() + 1);
            }
            monthsToCheck.forEach(key => {
                const [y,m] = key.split('-').map(n=>parseInt(n));
                const daysInMonth = getDaysInMonth(y,m);
                const d = new Date(Date.UTC(y,m,Math.min(payDay,daysInMonth)));
                if (d >= pStart && d <= pEnd && d >= start && (!end || d <= end)) dates.push(d);
            });
        } else if (freq === 'Semanal') {
            if (start > pEnd || (end && end < pStart)) return [];
            const payDow = start.getUTCDay();
            let d = new Date(pStart.getTime());
            while (d <= pEnd) {
                if (d.getUTCDay() === payDow && d >= start && (!end || d <= end)) dates.push(new Date(d));
                d.setUTCDate(d.getUTCDate() + 1);
            }
        } else if (freq === 'Bi-semanal') {
            if (start > pEnd || (end && end < pStart)) return [];
            let payDate = new Date(start.getTime());
            while (payDate < pStart) {
                payDate = addWeeks(payDate, 2);
                if (end && payDate > end) return dates;
            }
            while (payDate <= pEnd) {
                if (!end || payDate <= end) dates.push(new Date(payDate));
                payDate = addWeeks(payDate, 2);
            }
        }
        return dates;
    }

    function getIncomeOccurrencesInPeriod(income, pStart, pEnd, periodicity) {
        if (!income || !income.start_date || !(pStart instanceof Date) || !(pEnd instanceof Date) || pStart > pEnd) return 0;
        const start = new Date(income.start_date);
        const end = income.end_date ? new Date(income.end_date) : null;
        const freq = income.frequency || 'Mensual';

        if (freq === 'Único') {
            return (start >= pStart && start <= pEnd) ? 1 : 0;
        } else if (freq === 'Mensual') {
            if (start > pEnd || (end && end < pStart)) return 0;
            const payDay = start.getUTCDate();
            if (periodicity === 'Semanal') {
                const candidates = [];
                const monthsToCheck = new Set([
                    `${pStart.getUTCFullYear()}-${pStart.getUTCMonth()}`,
                    `${pEnd.getUTCFullYear()}-${pEnd.getUTCMonth()}`
                ]);
                monthsToCheck.forEach(key => {
                    const [y,m] = key.split('-').map(n=>parseInt(n));
                    const daysInMonth = getDaysInMonth(y,m);
                    candidates.push(new Date(Date.UTC(y, m, Math.min(payDay, daysInMonth))));
                });
                for (const payDate of candidates) {
                    if (payDate >= pStart && payDate <= pEnd && start <= payDate && (!end || end >= payDate)) return 1;
                }
                return 0;
            } else {
                const year = pStart.getUTCFullYear();
                const month = pStart.getUTCMonth();
                const daysInMonth = getDaysInMonth(year, month);
                const payDate = new Date(Date.UTC(year, month, Math.min(payDay, daysInMonth)));
                return (payDate >= pStart && payDate <= pEnd && start <= payDate && (!end || end >= payDate)) ? 1 : 0;
            }
        } else if (freq === 'Semanal') {
            if (start > pEnd || (end && end < pStart)) return 0;
            if (periodicity === 'Semanal') {
                return 1;
            } else {
                let count = 0;
                const payDow = start.getUTCDay();
                let d = new Date(pStart.getTime());
                while (d <= pEnd) {
                    if (d.getUTCDay() === payDow && d >= start && (!end || d <= end)) count++;
                    d.setUTCDate(d.getUTCDate() + 1);
                }
                return count;
            }
        } else if (freq === 'Bi-semanal') {
            if (start > pEnd || (end && end < pStart)) return 0;
            let count = 0;
            let payDate = new Date(start.getTime());
            while (payDate < pStart) {
                payDate = addWeeks(payDate, 2);
                if (end && payDate > end) return count;
            }
            while (payDate <= pEnd) {
                if (!end || payDate <= end) count++;
                payDate = addWeeks(payDate, 2);
            }
            return count;
        }
        return 0;
    }

    async function calculateExpenseDistribution(periodStart, periodicity) {
        const periodEnd = getPeriodEndDate(periodStart, periodicity);
        if (!currentBackupData) return { totals: {}, methodTotals: {} };
        await ensureUsdClpRatesForPeriodRange(periodStart, periodEnd, {
            expenses: currentBackupData.expenses,
            useInstantExpenses: currentBackupData.use_instant_expenses,
            periodicity,
            includeIncomes: false
        });
        const totals = {};
        const methodTotals = {};
        (currentBackupData.expenses || []).forEach(exp => {
            const { normalizedExpense, amountPerOccurrence } = buildExpenseOccurrenceContext(exp, currentBackupData.use_instant_expenses);
            if (!normalizedExpense || !normalizedExpense.start_date) return;
            const occurrenceDates = getExpenseOccurrenceDatesInPeriod(normalizedExpense, periodStart, periodEnd, currentBackupData.use_instant_expenses);
            if (!occurrenceDates || occurrenceDates.length === 0) return;

            const totalUsd = occurrenceDates.reduce((sum, date) => sum + convertAmountToUsd(amountPerOccurrence, exp.currency, date), 0);
            if (totalUsd <= 0) return;

            if (!totals[exp.category]) {
                totals[exp.category] = 0;
                methodTotals[exp.category] = { 'Efectivo / Debito': 0, Credito: 0 };
            }
            totals[exp.category] += totalUsd;
            const methodKey = exp.payment_method === 'Credito' ? 'Credito' : 'Efectivo / Debito';
            methodTotals[exp.category][methodKey] += totalUsd;
        });
        return { totals, methodTotals };
    }

    async function renderExpenseDistributionChart(periodStart, periodicity, canvas, existingInstance, precomputedData = null) {
        if (!canvas) return null;
        const { totals, methodTotals } = precomputedData || await calculateExpenseDistribution(periodStart, periodicity);
        const categories = Object.keys(totals).filter(cat => totals[cat] > 0);
        if (existingInstance) { existingInstance.destroy(); }
        if (categories.length === 0) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0,0,canvas.width,canvas.height);
            return null;
        }
        const data = categories.map(cat => totals[cat]);
        const colors = categories.map(cat => getCategoryColor(cat));
        const newChart = new Chart(canvas, {
            type: 'doughnut',
            data: { labels: categories, datasets: [{ data, backgroundColor: colors }] },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                const cat = ctx.label;
                                const total = totals[cat] || 0;
                                const cash = methodTotals[cat]['Efectivo / Debito'] || 0;
                                const credit = methodTotals[cat].Credito || 0;
                                const pcash = total ? ((cash/total)*100).toFixed(1) : '0';
                                const pcred = total ? ((credit/total)*100).toFixed(1) : '0';
                                return `${cat}: ${formatCurrencyJS(total, currentBackupData.display_currency_symbol || '$')} (Ef/Deb: ${pcash}%, Cred: ${pcred}%)`;
                            }
                        }
                    },
                    legend: { display: false }
                }
            }
        });
        canvas.onclick = async (evt) => {
            const points = newChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
            if (points.length) {
                const idx = points[0].index;
                const cat = newChart.data.labels[idx];
                const rows = await gatherPeriodTransactions(periodStart, periodicity, cat);
                openChartModal(`Transacciones - ${cat}`, rows);
            }
        };
        return newChart;
    }

    function renderSharedLegend(container, categories) {
        if (!container) return;
        container.innerHTML = '';
        const ul = document.createElement('ul');
        categories.forEach(cat => {
            const li = document.createElement('li');
            const sw = document.createElement('span');
            sw.className = 'legend-color';
            sw.style.backgroundColor = getCategoryColor(cat);
            li.appendChild(sw);
            li.appendChild(document.createTextNode(cat));
            ul.appendChild(li);
        });
        container.appendChild(ul);
    }

    // --- LÓGICA PESTAÑA BABY STEPS ---
    function renderBabySteps() {
        if (!babyStepsContainer || !currentBackupData || !currentBackupData.baby_steps_status) return;
        babyStepsContainer.innerHTML = '';

        const MAX_EXPANDED_HEIGHT_PX = 300;

        BABY_STEPS_DATA_JS.forEach((stepData, stepIndex) => {
            const stepDiv = document.createElement('div');
            stepDiv.classList.add('baby-step');

            const titleElement = document.createElement('h3');
            titleElement.classList.add('baby-step-title');
            titleElement.textContent = stepData.title;
            stepDiv.appendChild(titleElement);

            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('baby-step-details');
            // detailsDiv.style.display = 'none'; // Removed: Initial collapse handled by CSS max-height: 0

            const description = document.createElement('p');
            description.innerHTML = stepData.description.replace(/\n/g, '<br>');
            detailsDiv.appendChild(description);

            ['dos', 'donts'].forEach(listType => {
                if (stepData[listType] && stepData[listType].length > 0) {
                    const listTitle = document.createElement('h4');
                    listTitle.textContent = listType === 'dos' ? "✅ Qué haces:" : "❌ Qué no haces:";
                    detailsDiv.appendChild(listTitle);

                    const ul = document.createElement('ul');
                    stepData[listType].forEach((itemText, itemIndex) => {
                        const li = document.createElement('li');
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.id = `step-${stepIndex}-${listType}-${itemIndex}`;

                        if (currentBackupData.baby_steps_status[stepIndex] &&
                            currentBackupData.baby_steps_status[stepIndex][listType]) {
                            checkbox.checked = currentBackupData.baby_steps_status[stepIndex][listType][itemIndex] || false;
                        } else {
                            checkbox.checked = false;
                        }

                        checkbox.addEventListener('change', (e) => {
                            if (currentBackupData.baby_steps_status[stepIndex] &&
                                currentBackupData.baby_steps_status[stepIndex][listType]) {
                                currentBackupData.baby_steps_status[stepIndex][listType][itemIndex] = e.target.checked;
                            }
                        });

                        const label = document.createElement('label');
                        label.htmlFor = checkbox.id;
                        label.textContent = itemText;

                        li.appendChild(checkbox);
                        li.appendChild(label);
                        ul.appendChild(li);
                    });
                    detailsDiv.appendChild(ul);
                }
            });

            // Quiz button was here, removed as per requirements.
            stepDiv.appendChild(detailsDiv);

            titleElement.addEventListener('click', () => {
                // Toggle expanded class on the title
                titleElement.classList.toggle('expanded');
                // Toggle display of details
                if (detailsDiv.style.maxHeight && detailsDiv.style.maxHeight !== '0px') {
                    // Collapse
                    detailsDiv.style.overflowY = 'hidden'; // Set overflow to hidden before collapsing
                    detailsDiv.style.maxHeight = '0px';
                    detailsDiv.style.paddingTop = '0';
                    detailsDiv.style.marginTop = '0';
                } else {
                    // Expand
                    // Temporarily set overflow to hidden to correctly calculate scrollHeight without interference from potential scrollbars
                    detailsDiv.style.overflowY = 'hidden'; 
                    
                    const currentScrollHeight = detailsDiv.scrollHeight;

                    if (currentScrollHeight > MAX_EXPANDED_HEIGHT_PX) {
                        detailsDiv.style.maxHeight = MAX_EXPANDED_HEIGHT_PX + 'px';
                        detailsDiv.style.overflowY = 'auto'; // Allow scrolling if content exceeds max height
                    } else {
                        detailsDiv.style.maxHeight = currentScrollHeight + 'px';
                        detailsDiv.style.overflowY = 'hidden';
                    }
                    detailsDiv.style.paddingTop = '15px';
                    detailsDiv.style.marginTop = '10px';
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
            const empty = document.createElement('div');
            empty.textContent = "No hay cambios registrados aún.";
            empty.classList.add('log-entry-empty');
            changeLogList.appendChild(empty);
            return;
        }

        changeLogEntries.forEach(entry => {
            const detailsEl = document.createElement('details');
            detailsEl.classList.add('log-entry');

            const summaryEl = document.createElement('summary');
            summaryEl.classList.add('log-entry-header');

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

            summaryEl.appendChild(timestampSpan);
            summaryEl.appendChild(userSpan);
            summaryEl.appendChild(messageSpan);
            detailsEl.appendChild(summaryEl);

            if (entry.details && entry.details.length > 0) {
                const detailsUl = document.createElement('ul');
                detailsUl.classList.add('log-details-list');
                entry.details.forEach(detailMsg => {
                    const detailLi = document.createElement('li');
                    detailLi.textContent = detailMsg;
                    if (/(agregado|añadido|añadida|nueva)/i.test(detailMsg)) {
                        detailLi.classList.add('log-detail-added');
                    } else if (/(modific|edit|actualiz)/i.test(detailMsg)) {
                        detailLi.classList.add('log-detail-modified');
                    } else if (/(eliminado|borrado|quitado)/i.test(detailMsg)) {
                        detailLi.classList.add('log-detail-deleted');
                    }
                    detailsUl.appendChild(detailLi);
                });
                detailsEl.appendChild(detailsUl);
            }
            changeLogList.appendChild(detailsEl);
        });
    }


    // --- FUNCIONES AUXILIARES DE FECHAS Y FORMATO ---
    function formatCurrencyJS(value, symbol = '$') { if (value === null || typeof value !== 'number' || isNaN(value)) return `${symbol}0`; return `${symbol}${Math.round(value).toLocaleString('es-CL')}`; }
    function getCurrencyDisplaySymbol(code) {
        if (!code) return currentBackupData && currentBackupData.display_currency_symbol ? currentBackupData.display_currency_symbol : '$';
        if (code === 'USD') return 'US$';
        if (code === 'CLP') return '$';
        return currentBackupData && currentBackupData.display_currency_symbol ? currentBackupData.display_currency_symbol : '$';
    }
    function formatAmountWithCurrency(amount, currencyCode) {
        const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount || 0);
        const symbol = getCurrencyDisplaySymbol(currencyCode);
        const formatted = formatCurrencyJS(isNaN(numericAmount) ? 0 : numericAmount, symbol);
        return currencyCode ? `${formatted} ${currencyCode}` : formatted;
    }
    function addMonths(date, months) { const d = new Date(date.getTime()); d.setUTCMonth(d.getUTCMonth() + months); return d; }
    function addWeeks(date, weeks) { const d = new Date(date.getTime()); d.setUTCDate(d.getUTCDate() + (weeks * 7)); return d; }
    function addDays(date, days) { const d = new Date(date.getTime()); d.setUTCDate(d.getUTCDate() + days); return d; }
    function advancePeriodStart(date, periodicity) {
        if (periodicity === 'Mensual') return addMonths(date, 1);
        if (periodicity === 'Semanal') return addWeeks(date, 1);
        if (periodicity === 'Diario') return addDays(date, 1);
        throw new Error(`Periodicidad desconocida: ${periodicity}`);
    }
    function getISODateString(date) { if (!(date instanceof Date) || isNaN(date.getTime())) return ''; return date.getUTCFullYear() + '-' + ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2); }
    function getWeekNumber(d) { const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7)); const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1)); const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7); return [date.getUTCFullYear(), weekNo]; }
function getMondayOfWeek(year, week) {
    // Create a date for Jan 4th of the year. Jan 4th is always in week 1.
    const jan4 = new Date(Date.UTC(year, 0, 4));
    // Get the day of the week for Jan 4th (0=Sun, 1=Mon, ..., 6=Sat). Adjust Sunday to be 7 for ISO 8601 weekday.
    const jan4DayOfWeek = jan4.getUTCDay() || 7; 
    // Calculate the date of the first Monday of the year.
    const firstMondayOfYear = new Date(jan4.getTime());
    firstMondayOfYear.setUTCDate(jan4.getUTCDate() - (jan4DayOfWeek - 1));

    // Add (week - 1) * 7 days to the first Monday to get the Monday of the target week.
    const targetMonday = new Date(firstMondayOfYear.getTime());
    targetMonday.setUTCDate(firstMondayOfYear.getUTCDate() + (week - 1) * 7);
    return targetMonday;
}
    function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getUTCDate(); }

    /**
     * Calculates the start date of a period (month or week) based on a given date and periodicity.
     * Uses UTC date components for all calculations.
     * @param {Date} date The date to determine the period start from.
     * @param {string} periodicity "Mensual" or "Semanal".
     * @returns {Date} A new Date object representing the first day of the period at UTC midnight.
     */
    function getPeriodStartDate(date, periodicity) {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        let periodStart;

        if (periodicity === "Mensual") {
            periodStart = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
        } else if (periodicity === "Semanal") {
        // getWeekNumber returns [year, weekNumber] for the week the date is in.
        // This year might be different from date.getUTCFullYear() for dates at year boundaries.
        const [isoYearForWeek, weekNumber] = getWeekNumber(date);
        const monday = getMondayOfWeek(isoYearForWeek, weekNumber);
            periodStart = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate(), 0, 0, 0, 0));
        } else if (periodicity === "Diario") {
            periodStart = new Date(Date.UTC(year, month, date.getUTCDate(), 0, 0, 0, 0));
        } else {
            throw new Error("Invalid periodicity provided to getPeriodStartDate. Must be 'Mensual', 'Semanal' o 'Diario'.");
        }
        return periodStart;
    }

    /**
     * Calculates the end date of a period (month or week) based on a given date and periodicity.
     * The time is set to UTC midnight (00:00:00.000Z) of the last day of the period.
     * Uses UTC date components for all calculations.
     * @param {Date} date The date to determine the period end from.
     * @param {string} periodicity "Mensual" or "Semanal".
     * @returns {Date} A new Date object representing the last day of the period at UTC midnight.
     */
    function getPeriodEndDate(date, periodicity) {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        let periodEnd;

        if (periodicity === "Mensual") {
            // First day of next month, then subtract one day (which gives last day of current month)
            // Set to UTC midnight of that last day.
            periodEnd = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0)); // First day of next month
            periodEnd.setUTCDate(periodEnd.getUTCDate() - 1); // Last day of current month
        } else if (periodicity === "Semanal") {
        const [isoYearForWeek, weekNumber] = getWeekNumber(date);
        const monday = getMondayOfWeek(isoYearForWeek, weekNumber); // Monday of the current week (UTC midnight)
            // Sunday is Monday + 6 days
            periodEnd = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() + 6, 0, 0, 0, 0));
        } else if (periodicity === "Diario") {
            periodEnd = new Date(Date.UTC(year, month, date.getUTCDate(), 0, 0, 0, 0));
        } else {
            throw new Error("Invalid periodicity provided to getPeriodEndDate. Must be 'Mensual', 'Semanal' o 'Diario'.");
        }
        return periodEnd;
    }

    function findCurrentPeriodIndex(periodDates, periodicity) {
        if (!Array.isArray(periodDates) || periodDates.length === 0) return -1;
        const today = new Date();
        for (let i = 0; i < periodDates.length; i++) {
            const start = periodDates[i];
            if (!(start instanceof Date)) continue;
            const end = getPeriodEndDate(start, periodicity);
            const inclusiveEnd = new Date(end.getTime());
            inclusiveEnd.setUTCHours(23, 59, 59, 999);
            if (today >= start && today <= inclusiveEnd) {
                return i;
            }
        }
        return -1;
    }

    function highlightCurrentPeriodColumn(periodicity, headEl, bodyEl, periodDates) {
        const idx = findCurrentPeriodIndex(periodDates, periodicity);
        if (idx === -1) return;
        const headerCells = headEl.querySelectorAll('th');
        if (headerCells[idx + 1]) headerCells[idx + 1].classList.add('current-period');
        Array.from(bodyEl.rows).forEach(row => {
            if (row.cells[idx + 1]) row.cells[idx + 1].classList.add('current-period');
        });
    }

    function attachCashflowCellListeners(tbodyEl) {
        if (isTouchDevice || !tbodyEl) return;
        const cells = tbodyEl.querySelectorAll('td[data-period-index]');
        cells.forEach(cell => {
            cell.addEventListener('mouseenter', onCellMouseEnter);
            cell.addEventListener('mousemove', onCellMouseMove);
            cell.addEventListener('mouseleave', onCellMouseLeave);
        });
    }

    function onCellMouseEnter(e) {
        hoveredCell = e.currentTarget;
        hoverStartX = e.clientX;
        hoverStartY = e.clientY;
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => { showBreakdownPopup(hoveredCell); }, 1000);
    }

    function onCellMouseMove(e) {
        if (!hoveredCell) return;
        if (Math.abs(e.clientX - hoverStartX) > 3 || Math.abs(e.clientY - hoverStartY) > 3) {
            clearTimeout(hoverTimer);
            hoverStartX = e.clientX;
            hoverStartY = e.clientY;
            hoverTimer = setTimeout(() => { showBreakdownPopup(hoveredCell); }, 1000);
        }
    }

    function onCellMouseLeave() {
        clearTimeout(hoverTimer);
        hoveredCell = null;
        hideBreakdownPopup();
    }

    async function showBreakdownPopup(cell) {
        if (!cell || !breakdownPopup) return;
        const periodicity = cell.dataset.periodicity;
        const idx = parseInt(cell.dataset.periodIndex, 10);
        const rowKey = cell.dataset.rowKey || '';
        const category = cell.dataset.category || null;
        const startDate = cashflowPeriodDatesMap[periodicity] && cashflowPeriodDatesMap[periodicity][idx];
        if (!startDate) return;
        let rows = await gatherPeriodTransactions(startDate, periodicity, category);
        if (cell !== hoveredCell) return;
        if (rowKey === 'NET_INCOME') {
            rows = rows.filter(r => r.type === 'Ingreso');
        } else if (rowKey === 'FIXED_EXP_TOTAL' || rowKey === 'VAR_EXP_TOTAL') {
            const desiredType = rowKey === 'FIXED_EXP_TOTAL' ? 'Fijo' : 'Variable';
            rows = rows.filter(r => {
                if (r.type === 'Ingreso') return false;
                const t = currentBackupData.expense_categories[r.category] || 'Variable';
                return (t === desiredType);
            });
        }
        const symbol = currentBackupData && currentBackupData.display_currency_symbol ? currentBackupData.display_currency_symbol : '$';
        if (!rows || rows.length === 0) {
            breakdownPopup.innerHTML = '<em>Sin transacciones</em>';
        } else {
            let total = 0;
            const items = rows.map(r => {
                if (r.type === 'Reembolso') {
                    const amt = formatCurrencyJS(r.amount, symbol);
                    total += r.amount;
                    return `<li>+ ${amt} - Reembolso (${r.date})</li>`;
                }
                const sign = r.type === 'Gasto' ? '-' : '+';
                const amt = formatCurrencyJS(r.amount, symbol);
                total += r.type === 'Gasto' ? -r.amount : r.amount;
                if (r.type === 'Gasto') {
                    const orig = formatCurrencyJS(r.originalAmount, symbol);
                    const extra = r.installments && r.installments > 1 && !currentBackupData.use_instant_expenses ? ` [${orig} / ${r.installments}]` : ` [${orig}]`;
                    return `<li>${sign} ${amt}${extra} - ${r.name} (${r.date})</li>`;
                } else {
                    return `<li>${sign} ${amt} - ${r.name} (${r.date})</li>`;
                }
            }).join('');
            breakdownPopup.innerHTML = `<ul>${items}</ul><strong>Total: ${formatCurrencyJS(total, symbol)}</strong>`;
        }
        showElement(breakdownPopup);
        const rect = cell.getBoundingClientRect();
        const popupRect = breakdownPopup.getBoundingClientRect();
        breakdownPopup.style.left = (rect.left + window.scrollX + rect.width / 2 - popupRect.width / 2) + 'px';
        breakdownPopup.style.top = (rect.bottom + window.scrollY + 5) + 'px';
    }

    function hideBreakdownPopup() {
        hideElement(breakdownPopup);
    }

    document.addEventListener('click', (e) => {
        if (breakdownPopup && breakdownPopup.style.display === 'block' && !breakdownPopup.contains(e.target)) {
            hideBreakdownPopup();
        }
    });


    // --- INICIALIZACIÓN ---
    showLoginScreen();
    const today = new Date();
    const todayISO = getISODateString(today);
    incomeStartDateInput.value = todayISO;
    expenseMovementDateInput.value = todayISO;
    updateExpensePaymentDate();
    analysisStartDateInput.value = todayISO;
    incomeEndDateInput.disabled = true;
    expenseEndDateInput.disabled = true;
    updateAnalysisDurationLabel();
    // updateUsdClpInfoLabel(); // No longer needed here, called by activateTab or showMainContentScreen
    hideElement(incomeReimbursementCategoryContainer);

    if (applyMobileChartRangeButton) {
        applyMobileChartRangeButton.addEventListener('click', applyChartRange);
    }
    [mobileChartStartInput, mobileChartEndInput].forEach(inp => {
        if (!inp) return;
        inp.addEventListener('change', () => applyChartRange());
    });
    chartDatasetToggles.forEach(toggle => {
        toggle.addEventListener('change', () => applyDatasetVisibilityFromToggles());
    });
    if (chartLineStyleSelect) {
        chartLineStyleSelect.addEventListener('change', () => applyLineStylePreference());
    }
    if (resetChartZoomButton) {
        resetChartZoomButton.addEventListener('click', () => {
            disableChartZoom();
            applyChartRange();
        });
    }
    if (exportChartButton) {
        exportChartButton.addEventListener('click', exportChartAsImage);
    }

    pieMonthInputs.forEach(inp => { if (inp) inp.value = today.toISOString().slice(0,7); });
    if (pieWeekInputs[0]) {
        const [ywYear, ywWeek] = getWeekNumber(today);
        pieWeekInputs.forEach(inp => { if (inp) inp.value = `${ywYear}-W${('0'+ywWeek).slice(-2)}`; });
    }

    async function updatePieMonthCharts() {
        try {
            const allCats = new Set();
            const distributionCache = new Array(pieMonthInputs.length);
            for (let idx = 0; idx < pieMonthInputs.length; idx++) {
                const inp = pieMonthInputs[idx];
                if (!inp) continue;
                const val = inp.value;
                if (!val) {
                    if (pieMonthChartInstances[idx]) { pieMonthChartInstances[idx].destroy(); pieMonthChartInstances[idx] = null; }
                    const canvas = pieMonthCanvases[idx];
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        ctx.clearRect(0,0,canvas.width,canvas.height);
                    }
                    distributionCache[idx] = null;
                    continue;
                }
                const [y, m] = val.split('-');
                const start = new Date(Date.UTC(parseInt(y, 10), parseInt(m, 10) - 1, 1));
                const data = await calculateExpenseDistribution(start, 'Mensual');
                distributionCache[idx] = { start, data };
                Object.keys(data.totals).filter(c => data.totals[c] > 0).forEach(c => allCats.add(c));
            }
            renderSharedLegend(pieMonthLegend, Array.from(allCats));
            for (let idx = 0; idx < pieMonthInputs.length; idx++) {
                const cacheEntry = distributionCache[idx];
                const canvas = pieMonthCanvases[idx];
                if (!canvas || !cacheEntry) continue;
                pieMonthChartInstances[idx] = await renderExpenseDistributionChart(cacheEntry.start, 'Mensual', canvas, pieMonthChartInstances[idx], cacheEntry.data);
            }
        } catch (error) {
            console.error('Error al actualizar los gráficos de distribución mensual:', error);
        }
    }

    async function updatePieWeekCharts() {
        try {
            const allCats = new Set();
            const distributionCache = new Array(pieWeekInputs.length);
            for (let idx = 0; idx < pieWeekInputs.length; idx++) {
                const inp = pieWeekInputs[idx];
                if (!inp) continue;
                const val = inp.value;
                if (!val) {
                    if (pieWeekChartInstances[idx]) { pieWeekChartInstances[idx].destroy(); pieWeekChartInstances[idx] = null; }
                    const canvas = pieWeekCanvases[idx];
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        ctx.clearRect(0,0,canvas.width,canvas.height);
                    }
                    distributionCache[idx] = null;
                    continue;
                }
                const [y, w] = val.split('-W');
                const start = getMondayOfWeek(parseInt(y, 10), parseInt(w, 10));
                const data = await calculateExpenseDistribution(start, 'Semanal');
                distributionCache[idx] = { start, data };
                Object.keys(data.totals).filter(c => data.totals[c] > 0).forEach(c => allCats.add(c));
            }
            renderSharedLegend(pieWeekLegend, Array.from(allCats));
            for (let idx = 0; idx < pieWeekInputs.length; idx++) {
                const cacheEntry = distributionCache[idx];
                const canvas = pieWeekCanvases[idx];
                if (!canvas || !cacheEntry) continue;
                pieWeekChartInstances[idx] = await renderExpenseDistributionChart(cacheEntry.start, 'Semanal', canvas, pieWeekChartInstances[idx], cacheEntry.data);
            }
        } catch (error) {
            console.error('Error al actualizar los gráficos de distribución semanal:', error);
        }
    }

    pieMonthInputs.forEach(inp => inp && inp.addEventListener('change', updatePieMonthCharts));
    pieWeekInputs.forEach(inp => inp && inp.addEventListener('change', updatePieWeekCharts));

    updatePieMonthCharts();
    updatePieWeekCharts();

    // --- CONFIGURAR ZOOM EN EL GRÁFICO ---
    function enableChartZoom() {
        if (!cashflowChartInstance) return;
        chartZoomMode = true;
        if (cashflowChartCanvas) cashflowChartCanvas.style.cursor = 'move';
        cashflowChartInstance.options.plugins.zoom.pan.enabled = true;
        cashflowChartInstance.options.plugins.zoom.pan.modifierKey = isTouchDevice ? null : 'ctrl';
        cashflowChartInstance.options.plugins.zoom.zoom.wheel.enabled = !isTouchDevice;
        cashflowChartInstance.options.plugins.zoom.zoom.pinch.enabled = true;
        cashflowChartInstance.options.plugins.zoom.zoom.drag.enabled = !isTouchDevice;
        cashflowChartInstance.update();
        if (chartMessage) {
            if (isTouchDevice) {
                chartMessage.textContent = 'Modo zoom activo. Usa dos dedos para hacer zoom o mover el gráfico. Doble tap fuera del gráfico para salir.';
            } else {
                chartMessage.textContent = 'Modo zoom activo. Doble clic fuera del gráfico para salir.';
            }
        }
    }

    function disableChartZoom() {
        if (!cashflowChartInstance) return;
        cashflowChartInstance.resetZoom && cashflowChartInstance.resetZoom();
        cashflowChartInstance.options.plugins.zoom.pan.enabled = false;
        cashflowChartInstance.options.plugins.zoom.zoom.wheel.enabled = false;
        cashflowChartInstance.options.plugins.zoom.zoom.pinch.enabled = false;
        cashflowChartInstance.options.plugins.zoom.zoom.drag.enabled = false;
        cashflowChartInstance.update();
        if (cashflowChartCanvas) cashflowChartCanvas.style.cursor = 'zoom-in';
        chartZoomMode = false;
        if (chartMessage) chartMessage.textContent = 'Doble clic en el gráfico para activar el zoom.';
    }

    function applyChartRange() {
        if (!fullChartData) return;
        const startStr = mobileChartStartInput ? mobileChartStartInput.value : '';
        const endStr = mobileChartEndInput ? mobileChartEndInput.value : '';
        if (!startStr || !endStr) {
            renderCashflowChart(fullChartData.periodDates, fullChartData.incomes, fullChartData.totalExpenses, fullChartData.netFlows, fullChartData.endBalances, false);
            return;
        }
        const startDate = toUTCDate(startStr);
        const endDate = toUTCDate(endStr);
        if (isNaN(startDate) || isNaN(endDate) || startDate > endDate) {
            renderCashflowChart(fullChartData.periodDates, fullChartData.incomes, fullChartData.totalExpenses, fullChartData.netFlows, fullChartData.endBalances, false);
            return;
        }
        const fDates = [];
        const fInc = [];
        const fExp = [];
        const fNet = [];
        const fEnd = [];
        for (let i = 0; i < fullChartData.periodDates.length; i++) {
            const d = fullChartData.periodDates[i];
            if (d >= startDate && d <= endDate) {
                fDates.push(d);
                fInc.push(fullChartData.incomes[i]);
                fExp.push(fullChartData.totalExpenses[i]);
                fNet.push(fullChartData.netFlows[i]);
                fEnd.push(fullChartData.endBalances[i]);
            }
        }
        renderCashflowChart(fDates, fInc, fExp, fNet, fEnd, false);
    }

    function openChartModal(title, rows) {
        if (!chartModal || !chartModalTableBody || !chartModalTitle) return;
        chartModalTitle.textContent = title;
        chartModalTableBody.innerHTML = '';
        const symbol = currentBackupData && currentBackupData.display_currency_symbol ? currentBackupData.display_currency_symbol : '$';
        rows.forEach(r => {
            const tr = document.createElement('tr');
            tr.insertCell().textContent = r.type;
            tr.insertCell().textContent = r.name;
            tr.insertCell().textContent = formatCurrencyJS(r.amount, symbol);
            tr.insertCell().textContent = r.category || '';
            tr.insertCell().textContent = r.date || '';
            chartModalTableBody.appendChild(tr);
        });
        showElement(chartModal, 'flex');
    }
    function closeChartModal() {
        if (chartModal) hideElement(chartModal);
    }

    if (chartModalClose) {
        chartModalClose.addEventListener("click", closeChartModal);
        chartModalClose.addEventListener("touchstart", function(e) { e.preventDefault(); closeChartModal(); });
    }
    if (chartModal) chartModal.addEventListener("click", function(e) { if (e.target === chartModal) closeChartModal(); });

    async function gatherPeriodTransactions(pStart, periodicity, categoryFilter = null) {
        const pEnd = getPeriodEndDate(pStart, periodicity);
        if (!currentBackupData) return [];
        await ensureUsdClpRatesForPeriodRange(pStart, pEnd, {
            expenses: currentBackupData.expenses,
            incomes: currentBackupData.incomes,
            useInstantExpenses: currentBackupData.use_instant_expenses,
            periodicity
        });
        const rows = [];
        (currentBackupData.incomes || []).forEach(inc => {
            const occurrenceDates = getIncomeOccurrenceDatesInPeriod(inc, pStart, pEnd, periodicity);
            if (!occurrenceDates || occurrenceDates.length === 0) return;
            const amountPerOccurrence = parseFloat(inc.net_monthly || 0);
            const totalAmount = occurrenceDates.reduce((sum, date) => sum + convertAmountToUsd(amountPerOccurrence, inc.currency, date), 0);
            if (totalAmount <= 0) return;
            const category = inc.is_reimbursement ? inc.reimbursement_category : '';
            if (categoryFilter && categoryFilter !== category) return;
            rows.push({
                type: inc.is_reimbursement ? 'Reembolso' : 'Ingreso',
                name: inc.name,
                amount: totalAmount,
                originalAmount: amountPerOccurrence,
                occurrences: occurrenceDates.length,
                category,
                date: getISODateString(new Date(inc.start_date))
            });
        });
        (currentBackupData.expenses || []).forEach(exp => {
            if (categoryFilter && categoryFilter !== exp.category) return;
            const { normalizedExpense, amountPerOccurrence } = buildExpenseOccurrenceContext(exp, currentBackupData.use_instant_expenses);
            if (!normalizedExpense || !normalizedExpense.start_date) return;
            const occurrenceDates = getExpenseOccurrenceDatesInPeriod(normalizedExpense, pStart, pEnd, currentBackupData.use_instant_expenses);
            if (!occurrenceDates || occurrenceDates.length === 0) return;
            const totalAmount = occurrenceDates.reduce((sum, date) => sum + convertAmountToUsd(amountPerOccurrence, exp.currency, date), 0);
            if (totalAmount <= 0) return;
            rows.push({
                type: 'Gasto',
                name: exp.name,
                amount: totalAmount,
                originalAmount: parseFloat(exp.amount || 0),
                installments: parseInt(exp.installments || 1),
                occurrences: occurrenceDates.length,
                category: exp.category,
                date: getISODateString(new Date(exp.start_date))
            });
        });
        return rows;
    }

    function extractTableData(tableEl) {
        const headers = [];
        const headerClasses = [];
        tableEl.querySelectorAll('thead th').forEach(th => {
            headers.push(th.textContent.trim());
            headerClasses.push(th.className || '');
        });

        const rows = [];
        const rowClasses = [];
        const cellClasses = [];

        tableEl.querySelectorAll('tbody tr').forEach(tr => {
            const cells = [];
            const classes = [];
            tr.querySelectorAll('td').forEach(td => {
                cells.push(td.textContent.trim());
                classes.push(td.className || '');
            });
            rows.push(cells);
            rowClasses.push(tr.className || '');
            cellClasses.push(classes);
        });
        return { headers, headerClasses, rows, rowClasses, cellClasses };
    }

    function addTableSectionsToPdf(doc, title, data, margin) {
        const { headers, headerClasses, rows, rowClasses, cellClasses } = data;
        const pageWidth = doc.internal.pageSize.getWidth() - margin.left - margin.right;
        const firstColWidth = 110;
        const colWidth = 65;
        const colsPerPage = Math.max(1, Math.floor((pageWidth - firstColWidth) / colWidth));
        const firstCol = headers[0];
        const otherCols = headers.slice(1);
        let offset = 0;
        let startY = margin.top;
        // Reduce font size to minimize table row height
        doc.setFontSize(9);
        doc.text(title, margin.left, startY - 10);
        while (offset < otherCols.length) {
            const slice = otherCols.slice(offset, offset + colsPerPage);
            const pageHeaders = [firstCol, ...slice];
            const pageRows = rows.map((r) => [r[0], ...r.slice(offset + 1, offset + 1 + colsPerPage)]);
            const pageCellClasses = cellClasses.map(c => [c[0], ...c.slice(offset + 1, offset + 1 + colsPerPage)]);
            const pageHeaderClasses = [headerClasses[0], ...headerClasses.slice(offset + 1, offset + 1 + colsPerPage)];

            const colorMap = {
                'text-red': '#eb3b5a',
                'text-blue': '#3867d6',
                'text-green': '#20bf6b',
                'text-orange': '#fa8231'
            };

            doc.autoTable({
                head: [pageHeaders],
                body: pageRows,
                startY,
                theme: 'grid',
                styles: { fontSize: 6, textColor: '#2d3436' },
                headStyles: { fillColor: '#f1f6fb', textColor: '#3867d6', fontStyle: 'bold' },
                alternateRowStyles: { fillColor: '#f8f9fa' },
                margin,
                didParseCell: function (data) {
                    if (data.section === 'body') {
                        const rowCls = rowClasses[data.row.index] || '';
                        const cellCls = pageCellClasses[data.row.index][data.column.index] || '';
                        if (rowCls.includes('bg-header')) data.cell.styles.fillColor = '#eef3f8';
                        if (cellCls.includes('bold')) data.cell.styles.fontStyle = 'bold';
                        for (const cls in colorMap) {
                            if (cellCls.includes(cls)) { data.cell.styles.textColor = colorMap[cls]; break; }
                        }
                    } else if (data.section === 'head') {
                        const cls = pageHeaderClasses[data.column.index] || '';
                        if (cls.includes('current-period')) data.cell.styles.fillColor = '#eef3f8';
                    }
                },
                willDrawCell: function (data) {
                    const cls = data.section === 'body'
                        ? pageCellClasses[data.row.index][data.column.index] || ''
                        : pageHeaderClasses[data.column.index] || '';
                    if (cls.includes('current-period')) {
                        // Disable default fill so our background isn't overwritten
                        data.cell.styles.fillColor = null;
                        const { x, y, width, height } = data.cell;
                        doc.setFillColor(238, 243, 248); // #eef3f8
                        doc.rect(x, y, width, height, 'F');
                        const spacing = 6;
                        doc.setLineWidth(0.4);
                        // soft blue hatch as subtle background
                        doc.setDrawColor(206, 218, 246);
                        for (let i = -height; i < width; i += spacing) {
                            const x1 = Math.max(x, x + i);
                            const y1 = y + (x1 - (x + i));
                            const x2 = Math.min(x + width, x + i + height);
                            const y2 = y + height - ((x + i + height) - x2);
                            doc.line(x1, y1, x2, y2);
                        }
                    }
                }
            });
            offset += colsPerPage;
            if (offset < otherCols.length) {
                doc.addPage('letter', 'landscape');
                startY = margin.top;
                doc.text(title, margin.left, startY - 10);
            } else {
                startY = doc.lastAutoTable.finalY + 10;
            }
        }
        return startY;
    }

    async function printCashflowSummary() {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) {
            alert('Biblioteca jsPDF no cargada.');
            return;
        }
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
        if (typeof doc.autoTable !== 'function') {
            alert('Plugin AutoTable no disponible.');
            return;
        }
        const margin = { top: 40, left: 40, right: 40 };
        const mensualData = extractTableData(document.getElementById('cashflow-mensual-table'));
        addTableSectionsToPdf(doc, 'Flujo de Caja - Mensual', mensualData, margin);
        doc.addPage('letter', 'landscape');
        const semanalData = extractTableData(document.getElementById('cashflow-semanal-table'));
        addTableSectionsToPdf(doc, 'Flujo de Caja - Semanal', semanalData, margin);
        doc.addPage('letter', 'landscape');
        const diarioData = extractTableData(document.getElementById('cashflow-diario-table'));
        addTableSectionsToPdf(doc, 'Flujo de Caja - Diario', diarioData, margin);

        // --- Ingresos y Gastos por Mes ---
        function addSimpleTable(title, headers, rows) {
            doc.addPage('letter', 'landscape');
            doc.setFontSize(9);
            doc.text(title, margin.left, margin.top - 10);
            doc.autoTable({
                head: [headers],
                body: rows,
                startY: margin.top,
                theme: 'grid',
                styles: { fontSize: 7, textColor: '#2d3436' },
                headStyles: { fillColor: '#f1f6fb', textColor: '#3867d6', fontStyle: 'bold' },
                alternateRowStyles: { fillColor: '#f8f9fa' },
                margin
            });
        }

        if (currentBackupData && currentBackupData.analysis_start_date) {
            const start = new Date(currentBackupData.analysis_start_date);
            const duration = parseInt(currentBackupData.analysis_duration || 0, 10);
            const symbol = currentBackupData.display_currency_symbol || '$';
            const incomeRows = [];
            const expenseRows = [];
            let d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
            for (let i = 0; i < duration; i++) {
                const monthLabel = `${MONTH_NAMES_FULL_ES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
                const trs = await gatherPeriodTransactions(d, 'Mensual');
                trs.forEach(t => {
                    const amt = formatCurrencyJS(t.amount, symbol);
                    if (t.type === 'Gasto') {
                        const typ = currentBackupData.expense_categories[t.category] || 'Variable';
                        expenseRows.push([monthLabel, t.name, amt, t.category || '', typ, t.date]);
                    } else {
                        const typ = t.type === 'Reembolso' ? 'Reembolso' : 'Ingreso';
                        incomeRows.push([monthLabel, t.name, amt, typ, t.date]);
                    }
                });
                d = addMonths(d, 1);
            }
            if (incomeRows.length > 0) {
                addSimpleTable('Ingresos por Mes', ['Mes', 'Ingreso', 'Monto', 'Tipo', 'Fecha'], incomeRows);
            }
            if (expenseRows.length > 0) {
                addSimpleTable('Gastos por Mes', ['Mes', 'Gasto', 'Monto', 'Categoría', 'Tipo', 'Fecha'], expenseRows);
            }
        }

        doc.save('resumen_flujo_caja.pdf');
    }

    if (cashflowChartCanvas) {
        cashflowChartCanvas.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (!chartZoomMode) enableChartZoom();
        });
        if (isTouchDevice) {
            cashflowChartCanvas.addEventListener('touchstart', (e) => {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
    }

    document.addEventListener('dblclick', (e) => {
        if (chartZoomMode && cashflowChartCanvas && !cashflowChartCanvas.contains(e.target)) {
            disableChartZoom();
        }
    });

    // Trigger change event on expense frequency select to apply initial state
    expenseFrequencySelect.dispatchEvent(new Event('change'));
    if (cashflowChartCanvas) cashflowChartCanvas.style.cursor = 'zoom-in';

    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges()) {
            const diffDetails = generateDetailedChangeLog(originalLoadedData, currentBackupData);
            const logEntry = {
                timestamp: new Date().toISOString(),
                message: 'Advertencia: intento de cerrar la página con cambios sin guardar.',
                details: diffDetails,
                newVersionKey: null,
                previousVersionKey: currentBackupKey || null,
                user: auth.currentUser && auth.currentUser.email ? mapEmailToName(auth.currentUser.email) : 'Sistema'
            };
            if (!Array.isArray(changeLogEntries)) changeLogEntries = [];
            changeLogEntries.unshift(logEntry);
            renderLogTab();
            e.preventDefault();
            e.returnValue = '';
        }
        releaseEditLock();
    });
}); // This is the closing of DOMContentLoaded
