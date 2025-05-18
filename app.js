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
    const loadingMessage = document.getElementById('loading-message');

    const mainContentContainer = document.getElementById('main-content-container');
    const tabsContainer = document.querySelector('.tabs-container');

    const saveChangesButton = document.getElementById('save-changes-button');


    // --- ELEMENTOS PESTAÑA INGRESOS ---
    const incomeForm = document.getElementById('income-form');
    const incomeNameInput = document.getElementById('income-name');
    const incomeAmountInput = document.getElementById('income-amount');
    const incomeFrequencySelect = document.getElementById('income-frequency');
    const incomeStartDateInput = document.getElementById('income-start-date');
    const incomeEndDateInput = document.getElementById('income-end-date');
    const incomeOngoingCheckbox = document.getElementById('income-ongoing');
    const addIncomeButton = document.getElementById('add-income-button');
    const cancelEditIncomeButton = document.getElementById('cancel-edit-income-button');
    const incomesTableView = document.querySelector('#incomes-table-view tbody');
    let editingIncomeIndex = null;


    // --- ELEMENTOS PESTAÑA GASTOS ---
    const expenseForm = document.getElementById('expense-form');
    const expenseNameInput = document.getElementById('expense-name');
    const expenseAmountInput = document.getElementById('expense-amount');
    const expenseCategorySelect = document.getElementById('expense-category');
    const expenseFrequencySelect = document.getElementById('expense-frequency');
    const expenseStartDateInput = document.getElementById('expense-start-date');
    const expenseEndDateInput = document.getElementById('expense-end-date');
    const expenseOngoingCheckbox = document.getElementById('expense-ongoing');
    const expenseIsRealCheckbox = document.getElementById('expense-is-real');
    const addExpenseButton = document.getElementById('add-expense-button');
    const cancelEditExpenseButton = document.getElementById('cancel-edit-expense-button');
    const expensesTableView = document.querySelector('#expenses-table-view tbody');
    let editingExpenseIndex = null;


    // --- ELEMENTOS PESTAÑA FLUJO DE CAJA ---
    const cashflowTableBody = document.querySelector('#cashflow-table tbody');
    const cashflowTableHead = document.querySelector('#cashflow-table thead');
    const cashflowTitle = document.getElementById('cashflow-title');

    // --- CONSTANTES Y ESTADO ---
    const MONTH_NAMES_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const DATE_WEEK_START_FORMAT = (date) => `${date.getDate()}-${MONTH_NAMES_ES[date.getMonth()]}`;
    let currentBackupData = null;
    let currentBackupKey = null;

    // --- VALIDACIÓN DE CLAVES DE FIREBASE ---
    const FIREBASE_FORBIDDEN_KEY_CHARS = ['.', '$', '#', '[', ']', '/'];
    const FIREBASE_FORBIDDEN_CHARS_DISPLAY = FIREBASE_FORBIDDEN_KEY_CHARS.join(" ");

    function isFirebaseKeySafe(text) {
        if (typeof text !== 'string' || !text.trim()) { // Un nombre vacío o solo espacios no es ideal.
            return false; 
        }
        return !FIREBASE_FORBIDDEN_KEY_CHARS.some(char => text.includes(char));
    }

    // --- LÓGICA DE UI (VISIBILIDAD DE SECCIONES) ---
    function showLoginScreen() {
        authContainer.style.display = 'block';
        loginForm.style.display = 'block';
        logoutArea.style.display = 'none';
        dataSelectionContainer.style.display = 'none';
        mainContentContainer.style.display = 'none';
        clearAllDataViews();
        currentBackupData = null;
        currentBackupKey = null;
        backupSelector.innerHTML = '<option value="">-- Selecciona una versión --</option>';
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
        activateTab('ingresos');
    }

    function clearAllDataViews() {
        if (cashflowTableHead) cashflowTableHead.innerHTML = '';
        if (cashflowTableBody) cashflowTableBody.innerHTML = '';
        if (cashflowTitle) cashflowTitle.textContent = 'Flujo de Caja';
        if (incomesTableView) incomesTableView.innerHTML = '';
        if (expensesTableView) expensesTableView.innerHTML = '';
        if (expenseCategorySelect) expenseCategorySelect.innerHTML = '<option value="">Cargando categorías...</option>';
        resetIncomeForm();
        resetExpenseForm();
    }

    // --- AUTENTICACIÓN ---
    loginButton.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        authStatus.textContent = "Ingresando...";
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                authStatus.textContent = `Error: ${error.message}`;
                // No ocultar loginForm aquí, permitir reintentos.
            });
    });

    logoutButton.addEventListener('click', () => { auth.signOut(); });

    auth.onAuthStateChanged(user => {
        if (user) {
            showDataSelectionScreen(user);
        } else {
            showLoginScreen();
        }
    });

    // --- CARGA DE VERSIONES (BACKUPS) ---
    function fetchBackups() {
        loadingMessage.textContent = "Cargando lista de versiones...";
        loadingMessage.style.display = 'block';
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
                } else {
                    backupSelector.innerHTML = '<option value="">No hay versiones disponibles</option>';
                }
                loadingMessage.style.display = 'none';
            })
            .catch(error => {
                console.error("Error fetching backups:", error);
                authStatus.textContent = `Error cargando versiones: ${error.message}`;
                loadingMessage.textContent = "Error al cargar versiones.";
            });
    }

    loadBackupButton.addEventListener('click', () => {
        const selectedKey = backupSelector.value;
        if (selectedKey) {
            currentBackupKey = selectedKey;
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

        database.ref(`backups/${key}`).once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    currentBackupData = snapshot.val();
                    // Asegurar estructuras básicas si faltan en el backup
                    if (!currentBackupData.incomes) currentBackupData.incomes = [];
                    if (!currentBackupData.expenses) currentBackupData.expenses = [];
                    if (!currentBackupData.expense_categories) currentBackupData.expense_categories = {};
                    // Los campos como payments, budgets, etc., se añadirán con valores por defecto
                    // al guardar si no existen, para compatibilidad con Python.

                    // Parsear fechas
                    if (currentBackupData.analysis_start_date) {
                        currentBackupData.analysis_start_date = new Date(currentBackupData.analysis_start_date + 'T00:00:00Z'); // Asumir UTC para consistencia
                    }
                    (currentBackupData.incomes || []).forEach(inc => {
                        if (inc.start_date) inc.start_date = new Date(inc.start_date + 'T00:00:00Z');
                        if (inc.end_date) inc.end_date = new Date(inc.end_date + 'T00:00:00Z');
                    });
                    (currentBackupData.expenses || []).forEach(exp => {
                        if (exp.start_date) exp.start_date = new Date(exp.start_date + 'T00:00:00Z');
                        if (exp.end_date) exp.end_date = new Date(exp.end_date + 'T00:00:00Z');
                    });

                    renderIncomesTable();
                    renderExpensesTable();
                    populateExpenseCategoriesDropdown();
                    renderCashflowTable();
                    showMainContentScreen();
                } else {
                    alert("La versión seleccionada no contiene datos.");
                    currentBackupData = null;
                    currentBackupKey = null;
                }
                loadingMessage.style.display = 'none';
            })
            .catch(error => {
                console.error("Error loading backup data:", error);
                alert(`Error al cargar datos de la versión: ${error.message}`);
                loadingMessage.textContent = "Error al cargar datos.";
                currentBackupData = null;
                currentBackupKey = null;
            });
    }

    function formatBackupKey(key) {
        const ts = key.replace("backup_", "");
        if (ts.length === 15) { // YYYYMMDDTHHMMSS
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
    
    // --- GUARDAR CAMBIOS (COMO NUEVA VERSIÓN) ---
    saveChangesButton.addEventListener('click', () => {
        if (!currentBackupData) {
            alert("No hay datos cargados para guardar.");
            return;
        }

        // *** INICIO: Componente de seguridad y validación antes de guardar ***
        let dataIsValidForSaving = true;
        const validationIssues = [];

        (currentBackupData.incomes || []).forEach((inc, index) => {
            if (!isFirebaseKeySafe(inc.name)) {
                validationIssues.push(`Ingreso #${index + 1} ("${inc.name || 'Sin Nombre'}") tiene un nombre con caracteres no permitidos.`);
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

        if (!dataIsValidForSaving) {
            alert("No se pueden guardar los cambios debido a los siguientes problemas:\n- " + validationIssues.join("\n- ") +
                  `\n\nLos caracteres no permitidos son: ${FIREBASE_FORBIDDEN_CHARS_DISPLAY}. Por favor, corrige estos elementos.`);
            return;
        }
        // *** FIN: Componente de seguridad y validación antes de guardar ***

        const dataToSave = JSON.parse(JSON.stringify(currentBackupData)); 
        
        const defaultsFromPython = {
            version: "1.0_web",
            analysis_start_date: getISODateString(new Date()), // Usar función para string
            analysis_duration: 12,
            analysis_periodicity: "Mensual",
            analysis_initial_balance: 0,
            display_currency_symbol: "$",
            incomes: [],
            expense_categories: {}, 
            expenses: [],
            payments: {},       
            budgets: {},        
            baby_steps_status: [], 
            reminders_todos: []    
        };

        for (const key in defaultsFromPython) {
            if (dataToSave[key] === undefined || dataToSave[key] === null) {
                if (key === 'expense_categories' && currentBackupData.expense_categories && Object.keys(currentBackupData.expense_categories).length > 0) {
                    // No sobrescribir si ya existe, incluso si está vacío por filtrado.
                } else if (key === 'budgets' && currentBackupData.budgets && Object.keys(currentBackupData.budgets).length > 0) {
                    // No sobrescribir si ya existe.
                } else {
                    dataToSave[key] = defaultsFromPython[key];
                }
            }
        }
        
        dataToSave.analysis_start_date = getISODateString(new Date(dataToSave.analysis_start_date));
        (dataToSave.incomes || []).forEach(inc => {
            if (inc.start_date) inc.start_date = getISODateString(new Date(inc.start_date));
            if (inc.end_date) inc.end_date = getISODateString(new Date(inc.end_date));
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

        const now = new Date();
        const newBackupKey = `backup_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}T${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;

        loadingMessage.textContent = "Guardando cambios como nueva versión...";
        loadingMessage.style.display = 'block';

        database.ref('backups/' + newBackupKey).set(dataToSave)
            .then(() => {
                loadingMessage.style.display = 'none';
                alert(`Cambios guardados exitosamente como nueva versión: ${formatBackupKey(newBackupKey)}`);
                fetchBackups(); 
                backupSelector.value = newBackupKey; 
                currentBackupKey = newBackupKey; 
            })
            .catch(error => {
                loadingMessage.style.display = 'none';
                console.error("Error saving new version:", error);
                alert(`Error al guardar la nueva versión: ${error.message}`);
            });
    });


    // --- LÓGICA DE PESTAÑAS ---
    function activateTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));

        const activeContent = document.getElementById(tabId);
        const activeButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);

        if (activeContent) activeContent.classList.add('active');
        if (activeButton) activeButton.classList.add('active');
    }

    tabsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('tab-button')) {
            const tabId = event.target.dataset.tab;
            activateTab(tabId);
        }
    });


    // --- PESTAÑA INGRESOS ---
    incomeOngoingCheckbox.addEventListener('change', () => {
        incomeEndDateInput.disabled = incomeOngoingCheckbox.checked;
        if (incomeOngoingCheckbox.checked) {
            incomeEndDateInput.value = '';
        }
    });
    incomeFrequencySelect.addEventListener('change', () => {
        const isUnico = incomeFrequencySelect.value === 'Único';
        incomeOngoingCheckbox.disabled = isUnico;
        incomeEndDateInput.disabled = isUnico || incomeOngoingCheckbox.checked;
        if (isUnico) {
            incomeOngoingCheckbox.checked = false;
            incomeEndDateInput.value = '';
        }
    });


    incomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = incomeNameInput.value.trim();
        const amount = parseFloat(incomeAmountInput.value);
        const frequency = incomeFrequencySelect.value;
        // Fechas: asegurar que se creen como UTC para evitar problemas de zona horaria al convertir a string
        const startDateValue = incomeStartDateInput.value; // YYYY-MM-DD
        const endDateValue = incomeEndDateInput.value; // YYYY-MM-DD

        if (!isFirebaseKeySafe(name)) {
            alert(`El nombre del ingreso "${name}" contiene caracteres no permitidos: ${FIREBASE_FORBIDDEN_CHARS_DISPLAY}. Por favor, corrígelo.`);
            return;
        }
        if (!name) { // Adicionalmente, no permitir nombre vacío
            alert("El nombre del ingreso no puede estar vacío.");
            return;
        }

        const startDate = startDateValue ? new Date(startDateValue + 'T00:00:00Z') : null; // Asumir UTC
        const isOngoing = incomeOngoingCheckbox.checked;
        const endDate = (frequency === 'Único' || isOngoing || !endDateValue) ? null : new Date(endDateValue + 'T00:00:00Z'); // Asumir UTC

        if (isNaN(amount) || !startDate) {
            alert("Por favor, completa los campos obligatorios (Nombre, Monto, Fecha Inicio).");
            return;
        }
        if (endDate && startDate && endDate < startDate) {
            alert("La fecha de fin no puede ser anterior a la fecha de inicio.");
            return;
        }

        const incomeEntry = { name, net_monthly: amount, frequency, start_date: startDate, end_date: endDate };

        if (editingIncomeIndex !== null) { 
            currentBackupData.incomes[editingIncomeIndex] = incomeEntry;
        } else { 
            const existingIncome = (currentBackupData.incomes || []).find(inc => inc.name.toLowerCase() === name.toLowerCase());
            if (existingIncome) {
                alert(`Ya existe un ingreso con el nombre "${name}". Por favor, usa un nombre diferente.`);
                return;
            }
            if (!currentBackupData.incomes) currentBackupData.incomes = [];
            currentBackupData.incomes.push(incomeEntry);
        }
        
        renderIncomesTable();
        renderCashflowTable(); 
        resetIncomeForm();
    });

    function resetIncomeForm() {
        incomeForm.reset();
        incomeOngoingCheckbox.checked = true;
        incomeEndDateInput.disabled = true;
        incomeEndDateInput.value = '';
        incomeFrequencySelect.value = 'Mensual';
        addIncomeButton.textContent = 'Agregar Ingreso';
        cancelEditIncomeButton.style.display = 'none';
        editingIncomeIndex = null;
        // Re-establecer fecha de inicio por defecto si es necesario
        incomeStartDateInput.value = getISODateString(new Date());
    }
    cancelEditIncomeButton.addEventListener('click', resetIncomeForm);


    function renderIncomesTable() {
        if (!incomesTableView || !currentBackupData || !currentBackupData.incomes) return;
        incomesTableView.innerHTML = ''; 
        currentBackupData.incomes.forEach((income, index) => {
            const row = incomesTableView.insertRow();
            row.insertCell().textContent = income.name;
            row.insertCell().textContent = formatCurrencyJS(income.net_monthly, currentBackupData.display_currency_symbol || '$');
            row.insertCell().textContent = income.frequency;
            row.insertCell().textContent = income.start_date ? getISODateString(new Date(income.start_date)) : 'N/A';
            row.insertCell().textContent = income.end_date ? getISODateString(new Date(income.end_date)) : (income.frequency === 'Único' ? 'N/A (Único)' : 'Recurrente');

            const actionsCell = row.insertCell();
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.classList.add('small-button');
            editButton.onclick = () => loadIncomeForEdit(index);
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.classList.add('small-button', 'danger');
            deleteButton.onclick = () => deleteIncome(index);
            actionsCell.appendChild(deleteButton);
        });
    }

    function loadIncomeForEdit(index) {
        const income = currentBackupData.incomes[index];
        incomeNameInput.value = income.name;
        incomeAmountInput.value = income.net_monthly;
        incomeFrequencySelect.value = income.frequency;
        incomeStartDateInput.value = income.start_date ? getISODateString(new Date(income.start_date)) : '';
        
        const isUnico = income.frequency === 'Único';
        incomeOngoingCheckbox.disabled = isUnico;

        if (isUnico) {
            incomeOngoingCheckbox.checked = false;
            incomeEndDateInput.value = '';
            incomeEndDateInput.disabled = true;
        } else {
            incomeOngoingCheckbox.checked = !income.end_date;
            incomeEndDateInput.value = income.end_date ? getISODateString(new Date(income.end_date)) : '';
            incomeEndDateInput.disabled = incomeOngoingCheckbox.checked; // Corregido
        }
        
        addIncomeButton.textContent = 'Guardar Cambios';
        cancelEditIncomeButton.style.display = 'inline-block';
        editingIncomeIndex = index;
        document.getElementById('ingresos').scrollIntoView({ behavior: 'smooth' }); 
    }

    function deleteIncome(index) {
        if (confirm(`¿Estás seguro de que quieres eliminar el ingreso "${currentBackupData.incomes[index].name}"?`)) {
            currentBackupData.incomes.splice(index, 1);
            renderIncomesTable();
            renderCashflowTable(); 
            if(editingIncomeIndex === index) resetIncomeForm();
            else if (editingIncomeIndex !== null && editingIncomeIndex > index) {
                editingIncomeIndex--; // Ajustar índice si se eliminó un elemento anterior
            }
        }
    }


    // --- PESTAÑA GASTOS ---
    expenseOngoingCheckbox.addEventListener('change', () => {
        expenseEndDateInput.disabled = expenseOngoingCheckbox.checked;
        if (expenseOngoingCheckbox.checked) {
            expenseEndDateInput.value = '';
        }
    });
    expenseFrequencySelect.addEventListener('change', () => {
        const isUnico = expenseFrequencySelect.value === 'Único';
        expenseOngoingCheckbox.disabled = isUnico;
        expenseEndDateInput.disabled = isUnico || expenseOngoingCheckbox.checked;
        if (isUnico) {
            expenseOngoingCheckbox.checked = false;
            expenseEndDateInput.value = '';
        }
    });

    function populateExpenseCategoriesDropdown() {
        if (!expenseCategorySelect || !currentBackupData || !currentBackupData.expense_categories) {
            if(expenseCategorySelect) expenseCategorySelect.innerHTML = '<option value="">No hay categorías</option>';
            return;
        }
        expenseCategorySelect.innerHTML = '<option value="">-- Selecciona Categoría --</option>';
        const sortedCategories = Object.keys(currentBackupData.expense_categories).sort();
        sortedCategories.forEach(catName => {
            if (isFirebaseKeySafe(catName)) { // Solo agregar categorías seguras al dropdown
                const option = document.createElement('option');
                option.value = catName;
                option.textContent = catName;
                expenseCategorySelect.appendChild(option);
            }
        });
    }

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = expenseNameInput.value.trim();
        const amount = parseFloat(expenseAmountInput.value);
        const category = expenseCategorySelect.value;
        const frequency = expenseFrequencySelect.value;
        const startDateValue = expenseStartDateInput.value;
        const endDateValue = expenseEndDateInput.value;

        if (!isFirebaseKeySafe(name)) {
            alert(`El nombre del gasto "${name}" contiene caracteres no permitidos: ${FIREBASE_FORBIDDEN_CHARS_DISPLAY}. Por favor, corrígelo.`);
            return;
        }
        if (!name) {
            alert("El nombre del gasto no puede estar vacío.");
            return;
        }
        if (!isFirebaseKeySafe(category)) { 
            alert(`El nombre de la categoría "${category}" contiene caracteres no permitidos: ${FIREBASE_FORBIDDEN_CHARS_DISPLAY}. Esta categoría no es válida.`);
            return; 
        }


        const startDate = startDateValue ? new Date(startDateValue + 'T00:00:00Z') : null; // Asumir UTC
        const isOngoing = expenseOngoingCheckbox.checked;
        const endDate = (frequency === 'Único' || isOngoing || !endDateValue) ? null : new Date(endDateValue + 'T00:00:00Z'); // Asumir UTC
        const isReal = expenseIsRealCheckbox.checked;

        if (isNaN(amount) || !category || !startDate) {
            alert("Por favor, completa los campos obligatorios (Nombre, Monto, Categoría, Fecha Inicio).");
            return;
        }
        if (endDate && startDate && endDate < startDate) {
            alert("La fecha de fin no puede ser anterior a la fecha de inicio.");
            return;
        }

        const expenseType = currentBackupData.expense_categories[category] || "Variable"; 
        const expenseEntry = { name, amount, category, type: expenseType, frequency, start_date: startDate, end_date: endDate, is_real: isReal };

        if (editingExpenseIndex !== null) { 
            currentBackupData.expenses[editingExpenseIndex] = expenseEntry;
        } else { 
            const existingExpense = (currentBackupData.expenses || []).find(exp => exp.name.toLowerCase() === name.toLowerCase());
            if (existingExpense) {
                alert(`Ya existe un gasto con el nombre "${name}". Por favor, usa un nombre diferente.`);
                return;
            }
            if (!currentBackupData.expenses) currentBackupData.expenses = [];
            currentBackupData.expenses.push(expenseEntry);
        }

        renderExpensesTable();
        renderCashflowTable(); 
        resetExpenseForm();
    });
    
    function resetExpenseForm() {
        expenseForm.reset();
        expenseOngoingCheckbox.checked = true;
        expenseEndDateInput.disabled = true;
        expenseEndDateInput.value = '';
        expenseFrequencySelect.value = 'Mensual';
        expenseIsRealCheckbox.checked = false;
        if (expenseCategorySelect.options.length > 0 && expenseCategorySelect.value === "") { // Si hay opciones y ninguna seleccionada
             if (expenseCategorySelect.options[0].value !== "") expenseCategorySelect.selectedIndex = 0; // Seleccionar la primera real
             else if (expenseCategorySelect.options.length > 1) expenseCategorySelect.selectedIndex = 1;
        } else if (expenseCategorySelect.options.length === 0) {
            // No hay categorías, el dropdown está vacío.
        }
        addExpenseButton.textContent = 'Agregar Gasto';
        cancelEditExpenseButton.style.display = 'none';
        editingExpenseIndex = null;
        expenseStartDateInput.value = getISODateString(new Date());
    }
    cancelEditExpenseButton.addEventListener('click', resetExpenseForm);


    function renderExpensesTable() {
        if (!expensesTableView || !currentBackupData || !currentBackupData.expenses) return;
        expensesTableView.innerHTML = ''; 
        currentBackupData.expenses.forEach((expense, index) => {
            const row = expensesTableView.insertRow();
            row.insertCell().textContent = expense.name;
            row.insertCell().textContent = formatCurrencyJS(expense.amount, currentBackupData.display_currency_symbol || '$');
            row.insertCell().textContent = expense.category;
            row.insertCell().textContent = expense.frequency;
            row.insertCell().textContent = expense.start_date ? getISODateString(new Date(expense.start_date)) : 'N/A';
            row.insertCell().textContent = expense.end_date ? getISODateString(new Date(expense.end_date)) : (expense.frequency === 'Único' ? 'N/A (Único)' : 'Recurrente');
            row.insertCell().textContent = expense.is_real ? 'Sí' : 'No';

            const actionsCell = row.insertCell();
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.classList.add('small-button');
            editButton.onclick = () => loadExpenseForEdit(index);
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.classList.add('small-button', 'danger');
            deleteButton.onclick = () => deleteExpense(index);
            actionsCell.appendChild(deleteButton);
        });
    }

    function loadExpenseForEdit(index) {
        const expense = currentBackupData.expenses[index];
        expenseNameInput.value = expense.name;
        expenseAmountInput.value = expense.amount;
        expenseCategorySelect.value = expense.category; // Asume que la categoría existe en el dropdown
        expenseFrequencySelect.value = expense.frequency;
        expenseStartDateInput.value = expense.start_date ? getISODateString(new Date(expense.start_date)) : '';
        expenseIsRealCheckbox.checked = expense.is_real || false;

        const isUnico = expense.frequency === 'Único';
        expenseOngoingCheckbox.disabled = isUnico;
        if (isUnico) {
            expenseOngoingCheckbox.checked = false;
            expenseEndDateInput.value = '';
            expenseEndDateInput.disabled = true;
        } else {
            expenseOngoingCheckbox.checked = !expense.end_date;
            expenseEndDateInput.value = expense.end_date ? getISODateString(new Date(expense.end_date)) : '';
            expenseEndDateInput.disabled = expenseOngoingCheckbox.checked; // Corregido
        }

        addExpenseButton.textContent = 'Guardar Cambios';
        cancelEditExpenseButton.style.display = 'inline-block';
        editingExpenseIndex = index;
        document.getElementById('gastos').scrollIntoView({ behavior: 'smooth' });
    }

    function deleteExpense(index) {
        if (confirm(`¿Estás seguro de que quieres eliminar el gasto "${currentBackupData.expenses[index].name}"?`)) {
            currentBackupData.expenses.splice(index, 1);
            renderExpensesTable();
            renderCashflowTable(); 
            if(editingExpenseIndex === index) resetExpenseForm();
            else if (editingExpenseIndex !== null && editingExpenseIndex > index) {
                editingExpenseIndex--; 
            }
        }
    }


    // --- LÓGICA DE FLUJO DE CAJA (Cálculo y Renderizado) ---
    function renderCashflowTable() {
        if (!currentBackupData || !cashflowTableBody || !cashflowTableHead) return; 
        
        cashflowTableHead.innerHTML = '';
        cashflowTableBody.innerHTML = '';

        // Asegurar que analysis_start_date sea un objeto Date antes de calcular
        let analysisStartDateObj = currentBackupData.analysis_start_date;
        if (typeof analysisStartDateObj === 'string') {
            analysisStartDateObj = new Date(analysisStartDateObj + 'T00:00:00Z'); // Asumir UTC
        }
        if (!(analysisStartDateObj instanceof Date) || isNaN(analysisStartDateObj)) {
             console.error("Fecha de inicio de análisis inválida para renderCashflowTable:", currentBackupData.analysis_start_date);
             cashflowTableBody.innerHTML = '<tr><td colspan="2">Error: Fecha de inicio de análisis inválida.</td></tr>';
             return;
        }
        
        const tempCalcData = { // Crear un objeto temporal para el cálculo con fechas como Date
            ...currentBackupData,
            analysis_start_date: analysisStartDateObj, // Usar el objeto Date
            incomes: (currentBackupData.incomes || []).map(inc => ({
                ...inc,
                start_date: inc.start_date ? new Date(inc.start_date) : null,
                end_date: inc.end_date ? new Date(inc.end_date) : null,
            })),
            expenses: (currentBackupData.expenses || []).map(exp => ({
                ...exp,
                start_date: exp.start_date ? new Date(exp.start_date) : null,
                end_date: exp.end_date ? new Date(exp.end_date) : null,
            })),
        };


        const { periodDates, income_p, fixed_exp_p, var_exp_p, net_flow_p, end_bal_p, expenses_by_cat_p } = calculateCashFlowData(tempCalcData);

        if (!periodDates || periodDates.length === 0) {
            cashflowTableBody.innerHTML = '<tr><td colspan="2">No hay datos para mostrar. Ajusta los parámetros de análisis.</td></tr>';
            return;
        }

        const symbol = currentBackupData.display_currency_symbol || "$";
        const periodicity = currentBackupData.analysis_periodicity; // Ya debería ser string
        const initialBalance = parseFloat(currentBackupData.analysis_initial_balance);

        const startQDate = analysisStartDateObj; // Usar el objeto Date
        const startStr = `${('0' + startQDate.getUTCDate()).slice(-2)}/${('0' + (startQDate.getUTCMonth() + 1)).slice(-2)}/${startQDate.getUTCFullYear()}`;
        const durationUnit = periodicity === "Semanal" ? "Semanas" : "Meses";
        cashflowTitle.textContent = `Proyección Flujo de Caja (${currentBackupData.analysis_duration} ${durationUnit} desde ${startStr})`;

        const headerRow = cashflowTableHead.insertRow();
        const thConcept = document.createElement('th');
        thConcept.textContent = 'Categoría / Concepto';
        headerRow.appendChild(thConcept);

        periodDates.forEach(d => { // d aquí es un objeto Date de calculateCashFlowData
            const th = document.createElement('th');
            if (periodicity === "Semanal") {
                const [year, week] = getWeekNumber(d);
                const mondayOfWeek = getMondayOfWeek(year, week); // d ya es Date
                th.innerHTML = `Sem ${week} (${DATE_WEEK_START_FORMAT(mondayOfWeek)})<br>${year}`;
            } else {
                th.innerHTML = `${MONTH_NAMES_ES[d.getUTCMonth()]}<br>${d.getUTCFullYear()}`;
            }
            headerRow.appendChild(th);
        });

        const cf_row_definitions = [
            { key: 'START_BALANCE', label: "Saldo Inicial", isBold: true, isHeaderBg: true },
            { key: 'NET_INCOME', label: "Ingreso Total Neto", isBold: true },
        ];

        const fixedCategories = currentBackupData.expense_categories ? Object.keys(currentBackupData.expense_categories).filter(cat => currentBackupData.expense_categories[cat] === "Fijo").sort() : [];
        const variableCategories = currentBackupData.expense_categories ? Object.keys(currentBackupData.expense_categories).filter(cat => currentBackupData.expense_categories[cat] === "Variable").sort() : [];

        fixedCategories.forEach(cat => {
            cf_row_definitions.push({ key: `CAT_${cat}`, label: cat, isIndent: true, category: cat });
        });
        cf_row_definitions.push({ key: 'FIXED_EXP_TOTAL', label: "Total Gastos Fijos", isBold: true, isHeaderBg: true });

        variableCategories.forEach(cat => {
            cf_row_definitions.push({ key: `CAT_${cat}`, label: cat, isIndent: true, category: cat });
        });
        cf_row_definitions.push({ key: 'VAR_EXP_TOTAL', label: "Total Gastos Variables", isBold: true, isHeaderBg: true });

        cf_row_definitions.push({ key: 'NET_FLOW', label: "Flujo Neto del Período", isBold: true });
        cf_row_definitions.push({ key: 'END_BALANCE', label: "Saldo Final Estimado", isBold: true, isHeaderBg: true });

        cf_row_definitions.forEach((def, rowIndex) => {
            const tr = cashflowTableBody.insertRow();
            const tdLabel = tr.insertCell();
            tdLabel.textContent = def.isIndent ? `  ${def.label}` : def.label;
            if (def.isBold) tdLabel.classList.add('bold');
            if (def.isHeaderBg) tr.classList.add('bg-header');
            else if (rowIndex % 2 !== 0 && !def.isHeaderBg) tr.classList.add('bg-alt-row');


            for (let i = 0; i < periodDates.length; i++) {
                const tdValue = tr.insertCell();
                let value;
                let colorClass = '';

                switch (def.key) {
                    case 'START_BALANCE': value = (i === 0) ? initialBalance : end_bal_p[i - 1]; break;
                    case 'NET_INCOME': value = income_p[i]; break;
                    case 'FIXED_EXP_TOTAL': value = -fixed_exp_p[i]; break;
                    case 'VAR_EXP_TOTAL': value = -var_exp_p[i]; break;
                    case 'NET_FLOW': value = net_flow_p[i]; break;
                    case 'END_BALANCE':
                        value = end_bal_p[i];
                        colorClass = value >= 0 ? 'text-blue' : 'text-red';
                        break;
                    default:
                        if (def.category && expenses_by_cat_p[i]) { // Asegurar que expenses_by_cat_p[i] exista
                            value = -(expenses_by_cat_p[i][def.category] || 0);
                        } else {
                            value = 0;
                        }
                }
                tdValue.textContent = formatCurrencyJS(value, symbol);
                if (colorClass) tdValue.classList.add(colorClass);
                if (def.isBold) tdValue.classList.add('bold');
            }
        });
    }


    // --- FUNCIONES DE CÁLCULO (Adaptadas de tu script original) ---
    function calculateCashFlowData(data) { // data aquí ya tiene fechas como objetos Date
        const startDate = data.analysis_start_date; // Ya es Date
        const duration = parseInt(data.analysis_duration, 10);
        const periodicity = data.analysis_periodicity;
        const initialBalance = parseFloat(data.analysis_initial_balance);

        let periodDates = [];
        let income_p = Array(duration).fill(0.0);
        let fixed_exp_p = Array(duration).fill(0.0);
        let var_exp_p = Array(duration).fill(0.0);
        let net_flow_p = Array(duration).fill(0.0);
        let end_bal_p = Array(duration).fill(0.0);
        let expenses_by_cat_p = Array(duration).fill(null).map(() => ({}));

        let currentDate = new Date(startDate.getTime()); // Clonar para no modificar el original
        let currentBalance = initialBalance;

        const fixedCategories = data.expense_categories ? Object.keys(data.expense_categories).filter(cat => data.expense_categories[cat] === "Fijo").sort() : [];
        const variableCategories = data.expense_categories ? Object.keys(data.expense_categories).filter(cat => data.expense_categories[cat] === "Variable").sort() : [];
        const orderedCategories = [...fixedCategories, ...variableCategories];
        
        orderedCategories.forEach(cat => {
            for (let i = 0; i < duration; i++) {
                expenses_by_cat_p[i][cat] = 0.0;
            }
        });

        for (let i = 0; i < duration; i++) {
            const p_start = new Date(currentDate.getTime()); // Clonar
            let p_end;

            if (periodicity === "Mensual") {
                p_end = addMonths(new Date(p_start.getTime()), 1);
                p_end.setUTCDate(p_end.getUTCDate() - 1); // Usar UTC para consistencia con fechas
            } else { // Semanal
                p_end = addWeeks(new Date(p_start.getTime()), 1);
                p_end.setUTCDate(p_end.getUTCDate() - 1);
            }
            periodDates.push(p_start);

            let p_inc_total = 0.0;
            (data.incomes || []).forEach(inc => {
                if (!inc.start_date) return;
                const inc_start = inc.start_date; // Ya es Date
                const inc_end = inc.end_date;   // Ya es Date o null
                const net_amount = parseFloat(inc.net_monthly || 0);
                const inc_freq = inc.frequency || "Mensual";

                const isActiveRange = (inc_start <= p_end && (inc_end === null || inc_end >= p_start));
                if (!isActiveRange) return;

                let income_to_add = 0.0;
                if (inc_freq === "Mensual") {
                    if (periodicity === "Mensual") income_to_add = net_amount;
                    else if (periodicity === "Semanal" && p_start.getUTCDate() <= 7) income_to_add = net_amount; 
                } else if (inc_freq === "Único") {
                    if (p_start <= inc_start && inc_start <= p_end) income_to_add = net_amount;
                } else if (inc_freq === "Semanal") {
                    if (periodicity === "Semanal") income_to_add = net_amount;
                    else if (periodicity === "Mensual") income_to_add = net_amount * (52 / 12); 
                } else if (inc_freq === "Bi-semanal") {
                    if (periodicity === "Semanal") {
                        const days_diff = (p_start.getTime() - inc_start.getTime()) / (1000 * 60 * 60 * 24);
                        const weeks_diff = Math.floor(days_diff / 7);
                        if (days_diff >= 0 && weeks_diff % 2 === 0) income_to_add = net_amount;
                    } else if (periodicity === "Mensual") {
                        let paydays_in_month = 0;
                        let current_pay_date = new Date(inc_start.getTime());
                        while (current_pay_date <= p_end) {
                            if (current_pay_date >= p_start) paydays_in_month++;
                            current_pay_date = addWeeks(current_pay_date, 2);
                        }
                        income_to_add = net_amount * paydays_in_month;
                    }
                }
                p_inc_total += income_to_add;
            });
            income_p[i] = p_inc_total;

            let p_fix_exp_total = 0.0;
            let p_var_exp_total = 0.0;
            (data.expenses || []).forEach(exp => {
                if (!exp.start_date) return;
                const e_start = exp.start_date; // Ya es Date
                const e_end = exp.end_date;   // Ya es Date o null
                const amt_raw = parseFloat(exp.amount || 0);
                const freq = exp.frequency || "Mensual";
                const typ = exp.type || (data.expense_categories && data.expense_categories[exp.category]) || "Variable";
                const cat = exp.category;

                if (amt_raw < 0 || !cat || !orderedCategories.includes(cat)) return;

                const isActiveRange = (e_start <= p_end && (e_end === null || e_end >= p_start));
                if (!isActiveRange) return;
                
                let exp_add_this_period = 0.0;
                if (freq === "Mensual") {
                    if (periodicity === "Mensual") exp_add_this_period = amt_raw;
                    else if (periodicity === "Semanal" && p_start.getUTCDate() <= 7) exp_add_this_period = amt_raw;
                } else if (freq === "Único") {
                    if (p_start <= e_start && e_start <= p_end) exp_add_this_period = amt_raw;
                } else if (freq === "Semanal") {
                    if (periodicity === "Semanal") exp_add_this_period = amt_raw;
                    else if (periodicity === "Mensual") exp_add_this_period = amt_raw * (52/12); 
                } else if (freq === "Bi-semanal") {
                     if (periodicity === "Semanal") {
                        const days_diff = (p_start.getTime() - e_start.getTime()) / (1000 * 60 * 60 * 24);
                        const weeks_diff = Math.floor(days_diff / 7);
                        if (days_diff >=0 && weeks_diff % 2 === 0) exp_add_this_period = amt_raw;
                    } else if (periodicity === "Mensual") {
                        let paydays_in_month = 0;
                        let current_pay_date = new Date(e_start.getTime());
                        while (current_pay_date <= p_end) {
                            if (current_pay_date >= p_start) paydays_in_month++;
                            current_pay_date = addWeeks(current_pay_date, 2);
                        }
                        exp_add_this_period = amt_raw * paydays_in_month;
                    }
                }
                
                if (exp_add_this_period > 0) {
                    expenses_by_cat_p[i][cat] = (expenses_by_cat_p[i][cat] || 0) + exp_add_this_period;
                    if (typ === "Fijo") p_fix_exp_total += exp_add_this_period;
                    else p_var_exp_total += exp_add_this_period;
                }
            });
            fixed_exp_p[i] = p_fix_exp_total;
            var_exp_p[i] = p_var_exp_total;

            const net_flow = p_inc_total - (p_fix_exp_total + p_var_exp_total);
            net_flow_p[i] = net_flow;
            const end_bal = currentBalance + net_flow;
            end_bal_p[i] = end_bal;

            currentBalance = end_bal;
            currentDate = (periodicity === "Mensual") ? addMonths(currentDate, 1) : addWeeks(currentDate, 1);
        }
        return { periodDates, income_p, fixed_exp_p, var_exp_p, net_flow_p, end_bal_p, expenses_by_cat_p };
    }

    // --- FUNCIONES UTILITARIAS DE FECHA Y MONEDA ---
    function formatCurrencyJS(value, symbol) {
        if (value === null || typeof value !== 'number') {
            return `${symbol}0`;
        }
        return `${symbol}${Math.round(value).toLocaleString('es-CL')}`;
    }

    function addMonths(date, months) { // date es objeto Date
        const d = new Date(date.getTime()); // Clonar
        d.setUTCMonth(d.getUTCMonth() + months);
        return d;
    }

    function addWeeks(date, weeks) { // date es objeto Date
        const d = new Date(date.getTime()); // Clonar
        d.setUTCDate(d.getUTCDate() + (weeks * 7));
        return d;
    }

    // Devuelve YYYY-MM-DD desde un objeto Date, usando UTC para evitar problemas de zona horaria
    function getISODateString(date) { // Renombrado para claridad
        if (!(date instanceof Date) || isNaN(date)) return ''; // Manejar entrada inválida
        return date.getUTCFullYear() + '-' + ('0' + (date.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + date.getUTCDate()).slice(-2);
    }


    function getWeekNumber(d) { // d es objeto Date
        // Copia la fecha para no modificar la original y trabaja con UTC
        const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
        date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7)); // Mover al jueves de la semana actual
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
        return [date.getUTCFullYear(), weekNo];
    }

    function getMondayOfWeek(year, week) { // year y week son números
        // Crea una fecha para el primer día del año y luego añade las semanas.
        // El día 1 de la semana 1 es el lunes de esa semana.
        // Enero 1 puede ser semana 52 o 53 del año anterior.
        // Enero 4 siempre está en la semana 1.
        const firstDayOfYear = new Date(Date.UTC(year, 0, 4)); // 4 de enero siempre está en la semana 1
        const daysToMondayOfWeek1 = 1 - (firstDayOfYear.getUTCDay() || 7); // Días para llegar al lunes de la semana 1
        const mondayOfWeek1 = new Date(Date.UTC(year, 0, 4 + daysToMondayOfWeek1));
        
        const targetMonday = new Date(mondayOfWeek1.getTime());
        targetMonday.setUTCDate(targetMonday.getUTCDate() + (week - 1) * 7);
        return targetMonday;
    }

    // --- INICIALIZACIÓN ---
    showLoginScreen(); 
    const today = new Date();
    const todayISO = getISODateString(today); // Usar la nueva función
    incomeStartDateInput.value = todayISO;
    expenseStartDateInput.value = todayISO;
    incomeEndDateInput.disabled = true; 
    expenseEndDateInput.disabled = true; 

}); // Fin de DOMContentLoaded
