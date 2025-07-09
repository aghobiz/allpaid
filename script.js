document.addEventListener('DOMContentLoaded', () => {
    // --- 상태 관리 (Mock Database) ---
    let state = {
        groups: [
            { id: 1, name: '한아울', description: '중앙 기타 동아리', icon: '🎸', bank: '카카오뱅크', accountNumber: '3333-01-1234567', accountHolder: '김총무' },
            { id: 2, name: 'Project X', description: '창업 동아리', icon: '💡', bank: '토스뱅크', accountNumber: '190-123-456789', accountHolder: '박대표' },
        ],
        activities: [
            { type: 'project', id: 1, groupId: 1, name: '여름 정기공연', createdAt: '2025-07-01', fee: 30000, description: '🎸 한아울 여름 정기공연 참가 신청 🎸\n\n- 일시: 2025년 8월 15일\n- 회비: 30,000원 (뒷풀이 비용 포함)\n- 문의: 총무 김기타 (010-0000-0000)', virtualAccountNumber: '012-3456-7890-01', members: [
                { name: '김기타', feeToPay: 30000, status: 'paid' }, { name: '이보컬', feeToPay: 30000, status: 'paid' },
                { name: '박드럼', feeToPay: 30000, status: 'unpaid' }, { name: '최베이스', feeToPay: 30000, status: 'paid' },
            ]},
            { type: 'expense', id: 2, groupId: 1, description: '공연장 대관료', createdAt: '2025-07-03', amount: 50000 },
            { type: 'expense', id: 3, groupId: 1, description: '뒤풀이 비용', createdAt: '2025-07-05', amount: 75000 },
        ],
        notifications: [
            { id: 1, icon: 'fa-won-sign', color: 'text-main-blue', message: '<strong>김기타</strong> 님이 <strong>30,000원</strong>을 입금했어요.', time: '5분 전'},
            { id: 2, icon: 'fa-calendar-check', color: 'text-green-500', message: '<strong>여름 정기공연</strong> 프로젝트가 생성되었어요.', time: '1시간 전'},
            { id: 3, icon: 'fa-exclamation-circle', color: 'text-red-500', message: '<strong>의공인의 밤</strong> 회비 납부 마감일이 3일 남았어요.', time: '어제'},
        ],
        currentGroupId: null,
        currentProjectId: null,
        currentApplicant: null, // 신청자 정보 저장
        nextGroupId: 3,
        nextActivityId: 4,
    };

    const bankLogos = {
        '카카오뱅크': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Kakaobank_logo.svg/1200px-Kakaobank_logo.svg.png',
        '토스뱅크': 'https://static.toss.im/assets/png/logo_toss-bank-simbol.png',
        'KB국민은행': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/KB_Kookmin_Bank_logo.svg/1280px-KB_Kookmin_Bank_logo.svg.png',
        '신한은행': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Shinhan_Bank_Logo.svg/1280px-Shinhan_Bank_Logo.svg.png',
        '하나은행': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Hana_Bank_logo.svg/2560px-Hana_Bank_logo.svg.png'
    };

    const mainContent = document.getElementById('main-content');
    const fab = document.getElementById('add-activity-fab');
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('modal-content-area');
    const mainNav = document.getElementById('main-nav');

    // --- 화면 전환 로직 ---
    const screens = document.querySelectorAll('.screen');
    const navButtons = document.querySelectorAll('.nav-btn');
    const backButtons = document.querySelectorAll('.back-btn');

    function navigateTo(screenId, isApplicantView = false) {
        let targetScreen = document.getElementById(screenId);
        if (!targetScreen) return;
        
        screens.forEach(s => s.classList.remove('active'));
        targetScreen.classList.add('active');
        mainContent.scrollTop = 0;

        fab.style.display = (screenId === 'group-detail-screen') ? 'flex' : 'none';
        mainNav.style.display = isApplicantView ? 'none' : 'flex';

        if (!isApplicantView) {
            navButtons.forEach(btn => {
                if (btn.dataset.target === screenId) {
                    btn.classList.remove('text-gray-400');
                    btn.classList.add('text-main-blue');
                } else {
                    btn.classList.remove('text-main-blue');
                    btn.classList.add('text-gray-400');
                }
            });
        }
    }
    
    function renderGroups() {
        const groupListContainer = document.getElementById('group-list-container');
        if (state.groups.length === 0) {
            groupListContainer.innerHTML = `<div class="text-center py-16 bg-white rounded-2xl"><p class="text-gray-500">아직 관리하는 모임이 없어요.</p><p class="text-gray-500">새 모임을 만들어 시작해보세요!</p></div>`;
        } else {
            groupListContainer.innerHTML = `<h2 class="text-2xl font-bold text-gray-800 my-4">내가 관리하는 모임</h2><div id="group-list" class="space-y-4"></div>`;
            const listEl = document.getElementById('group-list');
            listEl.innerHTML = ''; // Clear previous list
            state.groups.forEach(group => {
                const groupCard = `
                    <div class="bg-white p-5 rounded-2xl shadow-sm cursor-pointer transition-transform hover:scale-105" data-group-id="${group.id}">
                        <div class="flex items-center">
                            <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl mr-4">${group.icon}</div>
                            <div class="flex-1">
                                <h3 class="font-bold text-lg text-gray-800">${group.name}</h3>
                                <p class="text-sm text-gray-500">${group.description}</p>
                            </div>
                        </div>
                    </div>
                `;
                listEl.innerHTML += groupCard;
            });
            document.querySelectorAll('[data-group-id]').forEach(card => {
                card.addEventListener('click', () => {
                    state.currentGroupId = parseInt(card.dataset.groupId);
                    renderGroupDetail();
                    navigateTo('group-detail-screen');
                });
            });
        }
    }

    function renderGroupDetail() {
        const group = state.groups.find(g => g.id === state.currentGroupId);
        document.getElementById('group-detail-title').textContent = group.name;
        document.getElementById('bank-logo').src = bankLogos[group.bank] || '';
        document.getElementById('bank-name').textContent = group.bank;
        document.getElementById('account-number').textContent = group.accountNumber;
        
        const groupActivities = state.activities.filter(a => a.groupId === state.currentGroupId);
        
        const income = groupActivities.filter(a => a.type === 'project').reduce((sum, p) => sum + p.members.filter(m => m.status === 'paid').reduce((memberSum, m) => memberSum + p.fee, 0), 0);
        const outcome = groupActivities.filter(a => a.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
        document.getElementById('group-balance').textContent = `${(income - outcome).toLocaleString()}원`;

        const allMembers = groupActivities.filter(a => a.type === 'project').reduce((acc, p) => {
            p.members.forEach(m => { if (!acc.find(am => am.name === m.name)) { acc.push(m); } });
            return acc;
        }, []);

        document.getElementById('member-count').textContent = allMembers.length;
        const memberListHorizontal = document.getElementById('member-list-horizontal');
        memberListHorizontal.innerHTML = '';
        allMembers.slice(0, 5).forEach(member => {
            memberListHorizontal.innerHTML += `<div class="flex flex-col items-center space-y-1 w-14 text-center"><div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">${member.name.charAt(0)}</div><p class="text-xs text-gray-600 truncate w-full">${member.name}</p></div>`;
        });
        if (allMembers.length > 5) {
            memberListHorizontal.innerHTML += `<div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600 self-center">+${allMembers.length - 5}</div>`;
        }
        
        const ongoingProjectsSection = document.getElementById('ongoing-projects-section');
        const ongoingProjectList = document.getElementById('ongoing-project-list');
        const ongoingProjects = groupActivities.filter(a => a.type === 'project' && a.members.some(m => m.status === 'unpaid'));

        ongoingProjectList.innerHTML = '';
        if (ongoingProjects.length > 0) {
            ongoingProjectsSection.style.display = 'block';
            ongoingProjects.forEach(project => {
                const paidCount = project.members.filter(m => m.status === 'paid').length;
                const totalCount = project.members.length;
                const progress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;
                const currentFee = project.fee * paidCount;

                const projectCard = `
                    <div class="bg-white p-5 rounded-2xl shadow-sm cursor-pointer" data-project-id="${project.id}">
                        <div class="flex justify-between items-center mb-2">
                            <h4 class="font-bold text-gray-800">${project.name}</h4>
                            <span class="text-sm text-gray-500">${paidCount}/${totalCount}명</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5">
                            <div class="bg-main-blue h-1.5 rounded-full" style="width: ${progress}%"></div>
                        </div>
                        <p class="text-right text-sm text-gray-600 mt-2">${currentFee.toLocaleString()}원 모금중</p>
                    </div>
                `;
                ongoingProjectList.innerHTML += projectCard;
            });
        } else {
            ongoingProjectsSection.style.display = 'none';
        }

        const activityFeed = document.getElementById('activity-feed');
        activityFeed.innerHTML = '';
        if (groupActivities.length === 0) {
             activityFeed.innerHTML = `<div class="text-center py-16 bg-white rounded-2xl"><p class="text-gray-500">아직 활동 내역이 없어요.</p><p class="text-gray-500">아래 + 버튼으로 시작해보세요!</p></div>`;
             return;
        }
        
        groupActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(activity => {
            let activityCard = '';
            if (activity.type === 'project') {
                const p = activity;
                activityCard = `<div class="bg-white p-5 rounded-2xl shadow-sm cursor-pointer" data-project-id="${p.id}">`;
            } else { // expense
                const e = activity;
                activityCard = `<div class="bg-white p-5 rounded-2xl shadow-sm cursor-pointer" data-expense-id="${e.id}">`;
            }
            
            if (activity.type === 'project') {
                const p = activity;
                const paidAmount = p.members.filter(m => m.status === 'paid').reduce((sum, m) => sum + p.fee, 0);
                activityCard += `
                    <div class="flex justify-between items-center">
                        <div class="flex items-center">
                            <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3"><i class="fas fa-users text-main-blue"></i></div>
                            <div>
                                <h4 class="font-bold text-gray-800">${p.name}</h4>
                                <p class="text-sm text-gray-400">${p.createdAt}</p>
                            </div>
                        </div>
                        <span class="font-bold text-main-blue">+${paidAmount.toLocaleString()}원</span>
                    </div>`;
            } else { // expense
                const e = activity;
                activityCard += `
                    <div class="flex justify-between items-center">
                        <div class="flex items-center">
                            <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mr-3"><i class="fas fa-receipt text-red-500"></i></div>
                            <div>
                                <h4 class="font-bold text-gray-800">${e.description}</h4>
                                <p class="text-sm text-gray-400">${e.createdAt}</p>
                            </div>
                        </div>
                        <span class="font-bold text-red-500">-${e.amount.toLocaleString()}원</span>
                    </div>`;
            }
            activityCard += `</div>`;
            activityFeed.innerHTML += activityCard;
        });
        
        document.querySelectorAll('[data-project-id]').forEach(card => {
            card.addEventListener('click', () => {
                state.currentProjectId = parseInt(card.dataset.projectId);
                renderProjectDetailVertical();
                navigateTo('project-detail-screen');
            });
        });
        
        document.querySelectorAll('[data-expense-id]').forEach(card => {
            card.addEventListener('click', () => {
                renderExpenseDetail(parseInt(card.dataset.expenseId));
            });
        });
    }

    function renderProjectDetailVertical(filter = 'all') {
        const project = state.activities.find(a => a.id === state.currentProjectId);
        if (!project || project.type !== 'project') return;
        
        document.getElementById('project-detail-title').textContent = project.name;
        document.getElementById('project-link-text').textContent = `.../apply?id=${project.id}`;
        
        const paidCount = project.members.filter(m => m.status === 'paid').length;
        const totalCount = project.members.filter(m => m.status !== 'cancelled').length;
        const totalFee = project.fee * totalCount;
        const currentFee = project.fee * paidCount;
        const progress = totalCount > 0 ? (currentFee / totalFee) * 100 : 0;

        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = `${currentFee.toLocaleString()}원 / ${totalFee.toLocaleString()}원`;
        document.getElementById('progress-member-text').textContent = `${paidCount}/${totalCount}명`;

        const memberList = document.getElementById('member-list-vertical');
        memberList.innerHTML = '';
        
        const filteredMembers = project.members.filter(m => {
            if (filter === 'all') return m.status !== 'cancelled';
            return m.status === filter;
        });

        if (filteredMembers.length === 0) {
            memberList.innerHTML = `<div class="text-center py-16"><p class="text-gray-500">해당하는 멤버가 없습니다.</p></div>`;
            return;
        }

        filteredMembers.forEach(member => {
            let statusBadge;
            switch(member.status) {
                case 'paid':
                    statusBadge = `<div class="text-sm font-bold text-green-500 bg-green-100 px-3 py-1 rounded-full">입금 완료</div>`;
                    break;
                case 'unpaid':
                    statusBadge = `<div class="text-sm font-bold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">입금 대기</div>`;
                    break;
                case 'cancelled':
                    statusBadge = `<div class="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">취소</div>`;
                    break;
            }
            const memberCard = `
                <div class="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                    <div>
                        <p class="font-bold text-gray-800">${member.name}</p>
                        <p class="text-sm text-gray-500">입금할 금액: ${member.feeToPay.toLocaleString()}원</p>
                    </div>
                    ${statusBadge}
                </div>
            `;
            memberList.innerHTML += memberCard;
        });
    }

    function renderNotifications() {
        const notificationList = document.getElementById('notification-list');
        notificationList.innerHTML = '';
        if(state.notifications.length === 0) {
            notificationList.innerHTML = `<div class="text-center py-16"><p class="text-gray-500">새로운 알림이 없습니다.</p></div>`;
            return;
        }
        state.notifications.forEach(notif => {
            const notifCard = `
                <div class="flex items-start p-4 bg-white rounded-lg">
                    <div class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 mr-4">
                        <i class="fas ${notif.icon} ${notif.color}"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-gray-800">${notif.message}</p>
                        <p class="text-sm text-gray-400 mt-1">${notif.time}</p>
                    </div>
                </div>
            `;
            notificationList.innerHTML += notifCard;
        });
    }

    function renderReport(activityId) {
        const project = state.activities.find(a => a.type === 'project' && a.id === activityId);
        if (!project) return;

        const income = project.members.filter(m => m.status === 'paid').reduce((sum, m) => sum + project.fee, 0);
        const expenses = state.activities.filter(a => a.groupId === project.groupId && a.type === 'expense');
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        const balance = income - totalExpense;

        modalContent.innerHTML = `
            <div class="flex justify-between items-start">
                <h2 class="text-2xl font-bold mb-4">정산 보고서</h2>
                <button class="close-modal-btn text-2xl text-gray-400">&times;</button>
            </div>
            <div class="space-y-4">
                <div class="p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-500">${project.name} 정산</p>
                    <p class="text-lg font-bold">최종 잔액: ${balance.toLocaleString()}원</p>
                </div>
                <div>
                    <h4 class="font-bold mb-2">수입: ${income.toLocaleString()}원</h4>
                    <ul class="text-sm space-y-1 pl-2">${project.members.filter(m => m.status === 'paid').map(m => `<li>${m.name}: +${project.fee.toLocaleString()}원</li>`).join('')}</ul>
                </div>
                <div>
                    <h4 class="font-bold mb-2">지출: ${totalExpense.toLocaleString()}원</h4>
                    <ul class="text-sm space-y-1 pl-2">${expenses.map(e => `<li>${e.description}: -${e.amount.toLocaleString()}원</li>`).join('')}</ul>
                </div>
            </div>
        `;
        modal.classList.add('visible');
    }
    
    function renderExpenseDetail(activityId) {
        const expense = state.activities.find(a => a.type === 'expense' && a.id === activityId);
        if (!expense) return;

        modalContent.innerHTML = `
            <div class="flex justify-between items-start">
                <h2 class="text-2xl font-bold mb-4">지출 상세 내역</h2>
                <button class="close-modal-btn text-2xl text-gray-400">&times;</button>
            </div>
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <p class="text-gray-500">내역</p>
                    <p class="font-bold text-lg">${expense.description}</p>
                </div>
                <div class="flex justify-between items-center">
                    <p class="text-gray-500">금액</p>
                    <p class="font-bold text-lg text-red-500">-${expense.amount.toLocaleString()}원</p>
                </div>
                <div class="flex justify-between items-center">
                    <p class="text-gray-500">날짜</p>
                    <p class="font-bold text-lg">${expense.createdAt}</p>
                </div>
            </div>
        `;
        modal.classList.add('visible');
    }

    function showApplicantForm(projectId) {
        state.currentProjectId = projectId;
        const project = state.activities.find(a => a.id === projectId);
        const group = state.groups.find(g => g.id === project.groupId);

        document.getElementById('applicant-form-title').textContent = project.name;
        document.getElementById('applicant-form-description').textContent = project.description;
        document.getElementById('applicant-form-fee').textContent = `참가비: ${project.fee.toLocaleString()}원`;
        document.getElementById('applicant-form-group').textContent = `주최: ${group.name}`;
        
        navigateTo('applicant-form-screen', true);
    }

    function renderApplicantStatus() {
        const project = state.activities.find(a => a.id === state.currentProjectId);
        const applicant = project.members.find(m => m.name === state.currentApplicant.name);
        
        document.getElementById('applicant-status-title').textContent = project.name;
        const contentEl = document.getElementById('applicant-status-content');
        
        let statusHTML = '';
        switch(applicant.status) {
            case 'unpaid':
                statusHTML = `
                    <div class="bg-white p-6 rounded-2xl shadow-sm">
                        <i class="fas fa-check-circle text-green-500 text-5xl mb-4"></i>
                        <h2 class="text-2xl font-bold mb-2">${applicant.name}님, 신청이 완료되었습니다!</h2>
                        <p class="text-gray-600 mb-6">아래 계좌로 입금하시면 참가 신청이 최종 확정됩니다.</p>
                        <div class="bg-gray-100 p-4 rounded-lg text-left">
                            <p class="text-sm text-gray-500">입금할 금액</p>
                            <p class="text-2xl font-bold text-main-blue">${applicant.feeToPay.toLocaleString()}원</p>
                            <p class="text-sm text-gray-500 mt-4">입금 계좌</p>
                            <p class="font-semibold">${project.virtualAccountNumber} (하나은행)</p>
                        </div>
                        <button id="cancel-application-btn" class="mt-6 w-full bg-red-500 text-white font-bold py-3 rounded-lg">참가 신청 취소</button>
                    </div>
                `;
                break;
            case 'paid':
                statusHTML = `
                    <div class="bg-white p-6 rounded-2xl shadow-sm">
                        <i class="fas fa-party-horn text-main-blue text-5xl mb-4"></i>
                        <h2 class="text-2xl font-bold mb-2">${applicant.name}님, 입금이 확인되었습니다!</h2>
                        <p class="text-gray-600">행사 당일 즐거운 시간 보내세요!</p>
                    </div>
                `;
                break;
            case 'cancelled':
                statusHTML = `
                    <div class="bg-white p-6 rounded-2xl shadow-sm">
                        <i class="fas fa-info-circle text-gray-500 text-5xl mb-4"></i>
                        <h2 class="text-2xl font-bold mb-2">참가 신청이 취소되었습니다.</h2>
                        <p class="text-gray-600">다음에 더 좋은 기회로 만나요!</p>
                    </div>
                `;
                break;
        }
        contentEl.innerHTML = statusHTML;
        navigateTo('applicant-status-screen', true);
    }


    // --- 이벤트 리스너 ---
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.target));
    });

    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentScreenId = document.querySelector('.screen.active').id;
            if (['group-detail-screen', 'add-group-screen', 'add-activity-screen', 'applicant-form-screen', 'applicant-status-screen'].includes(currentScreenId)) {
                navigateTo('home-screen');
            } else if (currentScreenId === 'project-detail-screen') {
                renderGroupDetail();
                navigateTo('group-detail-screen');
            }
        });
    });
    
    document.getElementById('close-applicant-view-btn').addEventListener('click', () => navigateTo('home-screen'));
    document.getElementById('close-applicant-status-btn').addEventListener('click', () => navigateTo('home-screen'));

    document.getElementById('add-group-btn').addEventListener('click', () => navigateTo('add-group-screen'));
    
    fab.addEventListener('click', () => navigateTo('add-activity-screen'));

    document.getElementById('add-group-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('group-name').value;
        const desc = document.getElementById('group-desc').value;
        const bank = document.getElementById('group-bank').value;
        const accountNumber = document.getElementById('group-account-number').value;
        const accountHolder = document.getElementById('group-account-holder').value;
        
        state.groups.push({ id: state.nextGroupId++, name, description: desc, icon: ['🎉', '🚀', '🌟', '💡', '🤝'][Math.floor(Math.random() * 5)], bank, accountNumber, accountHolder });
        e.target.reset();
        renderGroups();
        navigateTo('home-screen');
    });
    
    document.getElementById('add-project-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = e.target.querySelector('#project-name').value;
        const fee = parseInt(e.target.querySelector('#project-fee').value);
        const description = e.target.querySelector('#project-description').value;
        const membersText = e.target.querySelector('#project-members').value;
        const members = membersText ? membersText.split(',').map((m, i) => ({ name: m.trim(), feeToPay: fee, status: 'unpaid' })) : [];
        
        const newProject = { 
            type: 'project', id: state.nextActivityId++, groupId: state.currentGroupId, 
            name, fee, members, createdAt: new Date().toISOString().split('T')[0],
            virtualAccountNumber: `012-3456-7890-${state.nextActivityId}`,
            description: description
        };
        state.activities.push(newProject);
        e.target.reset();
        renderGroupDetail();
        navigateTo('group-detail-screen');
    });
    
    document.getElementById('add-expense-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('expense-desc').value;
        const amount = parseInt(document.getElementById('expense-amount').value);
        const newExpense = {
            type: 'expense', id: state.nextActivityId++, groupId: state.currentGroupId,
            description, amount, createdAt: new Date().toISOString().split('T')[0]
        };
        state.activities.push(newExpense);
        e.target.reset();
        renderGroupDetail();
        navigateTo('group-detail-screen');
    });

    document.querySelectorAll('.form-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.form-tab-btn').forEach(b => b.classList.remove('text-main-blue', 'border-main-blue'));
            e.currentTarget.classList.add('text-main-blue', 'border-main-blue');
            if (e.currentTarget.dataset.form === 'project') {
                document.getElementById('add-project-form').classList.remove('hidden');
                document.getElementById('add-expense-form').classList.add('hidden');
            } else {
                document.getElementById('add-project-form').classList.add('hidden');
                document.getElementById('add-expense-form').classList.remove('hidden');
            }
        });
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('text-main-blue', 'border-main-blue'));
            e.currentTarget.classList.add('text-main-blue', 'border-main-blue');
            renderProjectDetailVertical(e.currentTarget.dataset.tab);
        });
    });
    
    document.getElementById('add-project-member-btn').addEventListener('click', () => {
        const project = state.activities.find(p => p.id === state.currentProjectId);
        if (!project) return;

        const newMemberName = prompt('추가할 멤버의 이름을 입력하세요:');
        if (newMemberName) {
            const newMember = {
                name: newMemberName,
                feeToPay: project.fee,
                status: 'unpaid'
            };
            project.members.push(newMember);
            renderProjectDetailVertical();
            showToast(`${newMemberName} 님이 프로젝트에 추가되었습니다.`);
        }
    });

    document.getElementById('simulate-deposit-btn').addEventListener('click', () => {
        const project = state.activities.find(p => p.id === state.currentProjectId);
        if (!project) return;
        const unpaidMembers = project.members.filter(m => m.status === 'unpaid');
        if (unpaidMembers.length === 0) {
            showToast('모든 멤버가 입금을 완료했습니다!', 'info');
            return;
        }
        const randomMember = unpaidMembers[Math.floor(Math.random() * unpaidMembers.length)];
        randomMember.status = 'paid';
        const currentFilter = document.querySelector('.tab-btn.text-main-blue').dataset.tab;
        renderProjectDetailVertical(currentFilter);
        showToast(`✅ ${randomMember.name}님의 입금이 확인되었습니다!`);
    });
    
    document.querySelectorAll('.copy-account-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const container = e.currentTarget.closest('.bg-white');
            const accountInfoEl = container.querySelector('p[id*="account-number"]');
            const textToCopy = accountInfoEl.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => showToast('계좌번호가 복사되었습니다.')).catch(err => showToast('복사에 실패했습니다.', 'error'));
        });
    });
    
    document.getElementById('copy-project-link-btn').addEventListener('click', () => {
        const link = `https://modu-chongmu.app/apply?id=${state.currentProjectId}`;
        navigator.clipboard.writeText(link).then(() => {
            showToast('참가 신청 링크가 복사되었습니다.');
        });
    });
    
    document.getElementById('check-project-link-btn').addEventListener('click', () => {
        showApplicantForm(state.currentProjectId);
    });

    document.getElementById('generate-report-btn').addEventListener('click', () => renderReport(state.currentProjectId));
    
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay') || e.target.closest('.close-modal-btn')) {
            modal.classList.remove('visible');
        }
    });
    
    document.getElementById('apply-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const project = state.activities.find(p => p.id === state.currentProjectId);
        const applicantName = document.getElementById('applicant-name').value;

        const existingApplicant = project.members.find(m => m.name === applicantName);
        if (existingApplicant) {
            state.currentApplicant = existingApplicant;
        } else {
            const newMember = {
                name: applicantName,
                feeToPay: project.fee,
                status: 'unpaid'
            };
            project.members.push(newMember);
            state.currentApplicant = newMember;
        }
        e.target.reset();
        renderApplicantStatus();
    });
    
    document.getElementById('applicant-status-content').addEventListener('click', (e) => {
        if (e.target.id === 'cancel-application-btn') {
            if (confirm('정말로 참가 신청을 취소하시겠습니까?')) {
                const project = state.activities.find(p => p.id === state.currentProjectId);
                const applicant = project.members.find(m => m.name === state.currentApplicant.name);
                applicant.status = 'cancelled';
                renderApplicantStatus();
                showToast('참가 신청이 취소되었습니다.');
            }
        }
    });

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'fixed top-5 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-5 py-2 rounded-full text-md shadow-lg transition-all duration-300 animate-pulse';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, -20px)';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // --- 초기화 ---
    renderGroups();
    renderNotifications();
    fab.style.display = 'none';
});
</script>
</body>
</html>
