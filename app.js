document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    const authStatus = document.getElementById('auth-status');
    const authContainer = document.getElementById('auth-container');
    const dataContainer = document.getElementById('data-container');
    const backupSelector = document.getElementById('backup-selector');
    const loadBackupButton = document.getElementById('load-backup-button');
    const cashflowTableBody = document.querySelector('#cashflow-table tbody');
    const cashflowTableHead = document.querySelector('#cashflow-table thead');
    const cashflowContainer = document.getElementById('cashflow-container');
    const cashflowTitle = document.getElementById('cashflow-title');
    const loadingMessage = document.getElementById('loading-message');

    const MONTH_NAMES_ES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const DATE_WEEK_START_FORMAT = (date) => `${date.getDate()}-${MONTH_NAMES_ES[date.getMonth()]}`;

    let currentBackupData = null; // Para almacenar los datos del backup cargado

    // --- Autenticación ---
    loginButton.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        auth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                authStatus.textContent = `Conectado como: ${userCredential.user.email}`;
            })
            .catch(error => {
                authStatus.textContent = `Error: ${error.message}`;
            });
    });

    logoutButton.addEventListener('click', () => {
        auth.signOut().then(() => {
            authStatus.textContent = 'Sesión cerrada.';
        });
    });

    auth.onAuthStateChanged(user => {
        if (user) {
            authContainer.style.display = 'block'; // Mantener visible para logout
            loginButton.style.display = 'none';
            emailInput.style.display = 'none';
            passwordInput.style.display = 'none';
            logoutButton.style.display = 'inline-block';
            authStatus.textContent = `Conectado como: ${user.email}`;

            dataContainer.style.display = 'block';
            cashflowContainer.style.display = 'block';
            fetchBackups();
        } else {
            authContainer.style.display = 'block';
            loginButton.style.display = 'inline-block';
            emailInput.style.display = 'inline-block';
            passwordInput.style.display = 'inline-block';
            logoutButton.style.display = 'none';
            authStatus.textContent = 'No has iniciado sesión.';
            
            dataContainer.style.display = 'none';
            clearCashflowTable();
            currentBackupData = null;
            backupSelector.innerHTML = '<option value="">-- Selecciona un backup --</option>';
        }
    });

    // --- Carga de Backups ---
    function fetchBackups() {
        loadingMessage.textContent = "Cargando lista de backups...";
        database.ref('backups').once('value')
            .then(snapshot => {
                backupSelector.innerHTML = '<option value="">-- Selecciona un backup --</option>'; // Reset
                if (snapshot.exists()) {
                    const backups = snapshot.val();
                    const sortedKeys = Object.keys(backups).sort().reverse(); // Más recientes primero
                    sortedKeys.forEach(key => {
                        const option = document.createElement('option');
                        option.value = key;
                        option.textContent = formatBackupKey(key);
                        backupSelector.appendChild(option);
                    });
                    loadingMessage.textContent = "";
                } else {
                    backupSelector.innerHTML = '<option value="">No hay backups disponibles</option>';
                    loadingMessage.textContent = "No se encontraron backups.";
                }
            })
            .catch(error => {
                console.error("Error fetching backups:", error);
                authStatus.textContent = `Error cargando backups: ${error.message}`;
                loadingMessage.textContent = "Error al cargar backups.";
            });
    }
    
    loadBackupButton.addEventListener('click', () => {
        const selectedKey = backupSelector.value;
        if (selectedKey) {
            loadSpecificBackup(selectedKey);
        } else {
            alert("Por favor, selecciona un backup.");
        }
    });

    function loadSpecificBackup(key) {
        loadingMessage.textContent = `Cargando datos del backup: ${formatBackupKey(key)}...`;
        clearCashflowTable();
        database.ref(`backups/${key}`).once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    currentBackupData = snapshot.val();
                    // Parsear fechas de strings ISO a objetos Date
                    currentBackupData.analysis_start_date = new Date(currentBackupData.analysis_start_date + 'T00:00:00'); // Asegurar que sea local
                    
                    if (currentBackupData.incomes) {
                        currentBackupData.incomes.forEach(inc => {
                            if (inc.start_date) inc.start_date = new Date(inc.start_date + 'T00:00:00');
                            if (inc.end_date) inc.end_date = new Date(inc.end_date + 'T00:00:00');
                        });
                    }
                     if (currentBackupData.expenses) {
                        currentBackupData.expenses.forEach(exp => {
                            if (exp.start_date) exp.start_date = new Date(exp.start_date + 'T00:00:00');
                            if (exp.end_date) exp.end_date = new Date(exp.end_date + 'T00:00:00');
                        });
                    }

                    const { periodDates, income_p, fixed_exp_p, var_exp_p, net_flow_p, end_bal_p, expenses_by_cat_p } = calculateCashFlowData(currentBackupData);
                    renderCashflowTable(periodDates, income_p, fixed_exp_p, var_exp_p, net_flow_p, end_bal_p, expenses_by_cat_p, currentBackupData);
                    loadingMessage.textContent = "";
                } else {
                    alert("El backup seleccionado no contiene datos.");
                    loadingMessage.textContent = "Backup vacío o no encontrado.";
                    currentBackupData = null;
                }
            })
            .catch(error => {
                console.error("Error loading backup data:", error);
                alert(`Error al cargar datos del backup: ${error.message}`);
                loadingMessage.textContent = "Error al cargar datos del backup.";
                currentBackupData = null;
            });
    }
    
    function formatBackupKey(key) {
        // 'backup_YYYYMMDDTHHMMSS' -> 'DD/MM/YYYY HH:MM:SS'
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

    function clearCashflowTable() {
        cashflowTableHead.innerHTML = '';
        cashflowTableBody.innerHTML = '';
        cashflowTitle.textContent = 'Flujo de Caja';
    }

    // --- Lógica de Flujo de Caja (adaptada de Python) ---
    function formatCurrencyJS(value, symbol) {
        if (value === null || typeof value !== 'number') {
            return `${symbol}0`;
        }
        return `${symbol}${Math.round(value).toLocaleString('es-CL')}`; // es-CL usa . como separador de miles y , para decimales. toLocaleString maneja esto.
    }

    function addMonths(date, months) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    }

    function addWeeks(date, weeks) {
        const d = new Date(date);
        d.setDate(d.getDate() + (weeks * 7));
        return d;
    }
    
    function getISODate(date) { // YYYY-MM-DD
      return date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
    }

    function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
        return [d.getUTCFullYear(), weekNo];
    }
    
    function getMondayOfWeek(year, week) {
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dow = simple.getDay();
        const ISOweekStart = simple;
        if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        return ISOweekStart;
    }


    function calculateCashFlowData(data) {
        const startDate = new Date(data.analysis_start_date);
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

        let currentDate = new Date(startDate);
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
            const p_start = new Date(currentDate);
            let p_end;

            if (periodicity === "Mensual") {
                p_end = addMonths(new Date(p_start), 1);
                p_end.setDate(p_end.getDate() - 1);
            } else { // Semanal
                p_end = addWeeks(new Date(p_start), 1);
                p_end.setDate(p_end.getDate() - 1);
            }
            periodDates.push(p_start);

            let p_inc_total = 0.0;
            (data.incomes || []).forEach(inc => {
                if (!inc.start_date) return;
                const inc_start = new Date(inc.start_date);
                const inc_end = inc.end_date ? new Date(inc.end_date) : null;
                const net_amount = parseFloat(inc.net_monthly || 0);
                const inc_freq = inc.frequency || "Mensual";

                const isActiveRange = (inc_start <= p_end && (inc_end === null || inc_end >= p_start));
                if (!isActiveRange) return;

                let income_to_add = 0.0;
                if (inc_freq === "Mensual") {
                    if (periodicity === "Mensual") income_to_add = net_amount;
                    else if (periodicity === "Semanal" && p_start.getDate() <= 7) income_to_add = net_amount; // Python: p_start.day <= 7
                } else if (inc_freq === "Único") {
                    if (p_start <= inc_start && inc_start <= p_end) income_to_add = net_amount;
                } else if (inc_freq === "Semanal") {
                    if (periodicity === "Semanal") income_to_add = net_amount;
                    else if (periodicity === "Mensual") income_to_add = net_amount * (52 / 12); // Approx
                } else if (inc_freq === "Bi-semanal") {
                    if (periodicity === "Semanal") {
                        const days_diff = (p_start - inc_start) / (1000 * 60 * 60 * 24);
                        const weeks_diff = Math.floor(days_diff / 7);
                        if (days_diff >= 0 && weeks_diff % 2 === 0) income_to_add = net_amount;
                    } else if (periodicity === "Mensual") {
                        let paydays_in_month = 0;
                        let current_pay_date = new Date(inc_start);
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
                const e_start = new Date(exp.start_date);
                const e_end = exp.end_date ? new Date(exp.end_date) : null;
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
                    else if (periodicity === "Semanal" && p_start.getDate() <= 7) exp_add_this_period = amt_raw;
                } else if (freq === "Único") {
                    if (p_start <= e_start && e_start <= p_end) exp_add_this_period = amt_raw;
                } else if (freq === "Semanal") {
                    if (periodicity === "Semanal") exp_add_this_period = amt_raw;
                    else if (periodicity === "Mensual") exp_add_this_period = amt_raw * (52/12); // Approx
                } else if (freq === "Bi-semanal") {
                     if (periodicity === "Semanal") {
                        const days_diff = (p_start - e_start) / (1000 * 60 * 60 * 24);
                        const weeks_diff = Math.floor(days_diff / 7);
                        if (days_diff >=0 && weeks_diff % 2 === 0) exp_add_this_period = amt_raw;
                    } else if (periodicity === "Mensual") {
                        let paydays_in_month = 0;
                        let current_pay_date = new Date(e_start);
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

    function renderCashflowTable(periodDates, income_p, fixed_exp_p, var_exp_p, net_flow_p, end_bal_p, expenses_by_cat_p, data) {
        clearCashflowTable();
        if (!periodDates || periodDates.length === 0) {
            cashflowTableBody.innerHTML = '<tr><td colspan="2">No hay datos para mostrar.</td></tr>';
            return;
        }

        const symbol = data.display_currency_symbol || "$";
        const periodicity = data.analysis_periodicity;
        const initialBalance = parseFloat(data.analysis_initial_balance);

        // Update title
        const startQDate = new Date(data.analysis_start_date);
        const startStr = `${('0' + startQDate.getDate()).slice(-2)}/${('0' + (startQDate.getMonth() + 1)).slice(-2)}/${startQDate.getFullYear()}`;
        const durationUnit = periodicity === "Semanal" ? "Semanas" : "Meses";
        cashflowTitle.textContent = `Proyección Flujo de Caja (${data.analysis_duration} ${durationUnit} desde ${startStr})`;


        // Headers
        const headerRow = document.createElement('tr');
        const thConcept = document.createElement('th');
        thConcept.textContent = 'Categoría / Concepto';
        headerRow.appendChild(thConcept);

        periodDates.forEach(d => {
            const th = document.createElement('th');
            if (periodicity === "Semanal") {
                const [year, week] = getWeekNumber(d);
                const mondayOfWeek = getMondayOfWeek(year,week);
                th.innerHTML = `Sem ${week} (${DATE_WEEK_START_FORMAT(mondayOfWeek)})<br>${year}`;
            } else {
                th.innerHTML = `${MONTH_NAMES_ES[d.getMonth()]}<br>${d.getFullYear()}`;
            }
            headerRow.appendChild(th);
        });
        cashflowTableHead.appendChild(headerRow);
        
        // 1️⃣  Guardamos la etiqueta de la primera columna + todas las del período
        const headerLabels = Array.from(headerRow.children).map(th => th.innerHTML.replace(/<br\s*\/?>/gi, ' ').trim());


        // Data Rows
        const cf_row_definitions = [ // Simplified cf_row_indices
            { key: 'START_BALANCE', label: "Saldo Inicial", isBold: true, isHeaderBg: true },
            { key: 'NET_INCOME', label: "Ingreso Total Neto", isBold: true },
        ];

        const fixedCategories = data.expense_categories ? Object.keys(data.expense_categories).filter(cat => data.expense_categories[cat] === "Fijo").sort() : [];
        const variableCategories = data.expense_categories ? Object.keys(data.expense_categories).filter(cat => data.expense_categories[cat] === "Variable").sort() : [];
        
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
            const tr = document.createElement('tr');
            const tdLabel = document.createElement('td');
            tdLabel.textContent = def.isIndent ? `  ${def.label}` : def.label;
            if (def.isBold) tdLabel.classList.add('bold');
            if (def.isHeaderBg) tr.classList.add('bg-header');
            else if (rowIndex % 2 !== 0) tr.classList.add('bg-alt-row'); // Alt row for non-header bg
            
            tdLabel.setAttribute('data-label', headerLabels[0]); // ‘Categoría / Concepto’
            tr.appendChild(tdLabel);


            for (let i = 0; i < periodDates.length; i++) {
                const tdValue = document.createElement('td');
                let value;
                let colorClass = '';

                switch (def.key) {
                    case 'START_BALANCE': value = (i === 0) ? initialBalance : end_bal_p[i-1]; break;
                    case 'NET_INCOME': value = income_p[i]; break;
                    case 'FIXED_EXP_TOTAL': value = -fixed_exp_p[i]; break;
                    case 'VAR_EXP_TOTAL': value = -var_exp_p[i]; break;
                    case 'NET_FLOW': value = net_flow_p[i]; break;
                    case 'END_BALANCE': 
                        value = end_bal_p[i];
                        colorClass = value >= 0 ? 'text-blue' : 'text-red';
                        break;
                    default: // Category expenses
                        if (def.category) {
                            value = -(expenses_by_cat_p[i][def.category] || 0);
                        } else {
                            value = 0;
                        }
                }
                tdValue.textContent = formatCurrencyJS(value, symbol);
                tdValue.setAttribute('data-label', headerLabels[i + 1]); // ‘+1’ porque la 0 es la de categoría
                if (colorClass) tdValue.classList.add(colorClass);
                if (def.isBold) tdValue.classList.add('bold');
                tr.appendChild(tdValue);
            }
            cashflowTableBody.appendChild(tr);
        });
    }
});