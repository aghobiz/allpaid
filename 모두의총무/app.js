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
                { name: '박드럼', feeToPay: 30000, status: 'paid' }, { name: '최베이스', feeToPay: 30000, status: 'paid' },
            ]},
            { type: 'project', id: 4, groupId: 1, name: '겨울 MT', createdAt: '2025-12-01', fee: 50000, description: '❄️ 한아울 겨울 MT 참가 신청 ❄️\n\n- 일시: 2025년 12월 20-21일\n- 회비: 50,000원 (숙박비 포함)\n- 문의: 총무 김기타 (010-0000-0000)', virtualAccountNumber: '012-3456-7890-04', members: [
                { name: '김기타', feeToPay: 50000, status: 'paid' }, { name: '이보컬', feeToPay: 50000, status: 'paid' },
                { name: '박드럼', feeToPay: 50000, status: 'paid' }, { name: '최베이스', feeToPay: 50000, status: 'paid' },
                { name: '정키보드', feeToPay: 50000, status: 'unpaid' }, { name: '한사운드', feeToPay: 50000, status: 'unpaid' },
                { name: '윤기타', feeToPay: 50000, status: 'unpaid' }, { name: '임보컬', feeToPay: 50000, status: 'unpaid' },
            ]},
            { type: 'expense', id: 2, groupId: 1, description: '공연장 대관료', createdAt: '2025-07-03', amount: 80000 },
            { type: 'expense', id: 3, groupId: 1, description: '뒤풀이 비용', createdAt: '2025-07-05', amount: 40000 },
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
        nextActivityId: 5,
    };

    const bankLogos = {
        '카카오뱅크': 'bank-logos/Kakao_Bank_of_Korea_Logo.jpg',
        '토스뱅크': 'bank-logos/logo-blue-bgblack90.png',
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
        screens.forEach(s => {
            s.classList.remove('active');
            s.classList.remove('hidden');
        });
        targetScreen.classList.add('active');
        mainContent.scrollTop = 0;
        fab.style.display = (screenId === 'group-detail-screen') ? 'flex' : 'none';
        // 하단 네비게이션 바 표시/숨김
        const mainNav = document.getElementById('main-nav');
        const showNavScreens = ['home-screen', 'notifications-screen', 'my-page-screen'];
        if (mainNav) {
            if (showNavScreens.includes(screenId)) {
                mainNav.style.display = 'flex';
            } else {
                mainNav.style.display = 'none';
            }
        }
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
            // 타이틀은 index.html에서 이미 있으므로 여기서 추가하지 않음
            groupListContainer.innerHTML = `<div id="group-list" class="space-y-4"></div>`;
            const listEl = document.getElementById('group-list');
            listEl.innerHTML = '';
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
                    navigateTo('group-detail-screen');
                });
            });
        }
    }

    function renderGroupDetail() {
        const group = state.groups.find(g => g.id === state.currentGroupId);
        const titleEl = document.getElementById('group-detail-title');
        if (titleEl) titleEl.textContent = group.name;
        const bankLogoEl = document.getElementById('bank-logo');
        if (bankLogoEl) bankLogoEl.src = bankLogos[group.bank] || '';
        const bankNameEl = document.getElementById('bank-name');
        if (bankNameEl) bankNameEl.textContent = group.bank;
        const accountNumberEl = document.getElementById('account-number');
        if (accountNumberEl) accountNumberEl.textContent = group.accountNumber;
        
        const groupActivities = state.activities.filter(a => a.groupId === state.currentGroupId);
        
        const income = groupActivities.filter(a => a.type === 'project').reduce((sum, p) => sum + p.members.filter(m => m.status === 'paid').reduce((memberSum, m) => memberSum + p.fee, 0), 0);
        const outcome = groupActivities.filter(a => a.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
        const groupBalanceEl = document.getElementById('group-balance');
        if (groupBalanceEl) groupBalanceEl.textContent = `${(income - outcome).toLocaleString()}원`;

        const allMembers = groupActivities.filter(a => a.type === 'project').reduce((acc, p) => {
            p.members.forEach(m => { if (!acc.find(am => am.name === m.name)) { acc.push(m); } });
            return acc;
        }, []);

        const memberCountEl = document.getElementById('member-count');
        if (memberCountEl) memberCountEl.textContent = allMembers.length;
        const memberListHorizontal = document.getElementById('member-list-horizontal');
        if (memberListHorizontal) {
            memberListHorizontal.innerHTML = '';
            allMembers.slice(0, 5).forEach(member => {
                memberListHorizontal.innerHTML += `<div class="flex flex-col items-center space-y-1 w-14 text-center"><div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">${member.name.charAt(0)}</div><p class="text-xs text-gray-600 truncate w-full">${member.name}</p></div>`;
            });
            if (allMembers.length > 5) {
                memberListHorizontal.innerHTML += `<div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-600 self-center">+${allMembers.length - 5}</div>`;
            }
        }
        
        const ongoingProjectsSection = document.getElementById('ongoing-projects-section');
        const ongoingProjectList = document.getElementById('ongoing-project-list');
        const ongoingProjects = groupActivities.filter(a => a.type === 'project' && a.members.some(m => m.status === 'unpaid'));

        if (ongoingProjectList) {
            ongoingProjectList.innerHTML = '';
            if (ongoingProjects.length > 0) {
                if (ongoingProjectsSection) ongoingProjectsSection.style.display = 'block';
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
                if (ongoingProjectsSection) ongoingProjectsSection.style.display = 'none';
            }
        }

        const activityFeed = document.getElementById('activity-feed');
        if (activityFeed) {
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
        }
        
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
        const project = state.activities.find(a => a.type === 'project' && a.id === state.currentProjectId);
        if (!project) return;
        const group = state.groups.find(g => g.id === project.groupId);
        
        const projectDetailTitleEl = document.getElementById('project-detail-title');
        if (projectDetailTitleEl) projectDetailTitleEl.textContent = project.name;
        const projectLinkTextEl = document.getElementById('project-link-text');
        if (projectLinkTextEl) projectLinkTextEl.textContent = `.../apply?id=${project.id}`;
        
        const paidCount = project.members.filter(m => m.status === 'paid').length;
        const totalCount = project.members.filter(m => m.status !== 'cancelled').length;
        const totalFee = project.fee * totalCount;
        const currentFee = project.fee * paidCount;
        const progress = totalCount > 0 ? (currentFee / totalFee) * 100 : 0;

        const progressBarEl = document.getElementById('progress-bar');
        if (progressBarEl) progressBarEl.style.width = `${progress}%`;
        const progressTextEl = document.getElementById('progress-text');
        if (progressTextEl) progressTextEl.textContent = `${currentFee.toLocaleString()}원 / ${totalFee.toLocaleString()}원`;
        const progressMemberTextEl = document.getElementById('progress-member-text');
        if (progressMemberTextEl) progressMemberTextEl.textContent = `${paidCount}/${totalCount}명`;

        const memberList = document.getElementById('member-list-vertical');
        if (memberList) {
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
                        statusBadge = `<div class="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">입금 완료</div>`;
                        break;
                    case 'unpaid':
                        statusBadge = `<div class="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">입금 대기</div>`;
                        break;
                    case 'cancelled':
                        statusBadge = `<div class="text-sm font-bold text-red-500 bg-red-100 px-3 py-1 rounded-full">취소</div>`;
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
        // 프로젝트 정보 표시
        document.getElementById('project-virtual-account').textContent = project.virtualAccountNumber ? `${project.virtualAccountNumber} (가상계좌)` : '';
        document.getElementById('project-group-name').textContent = group.name;
        // 문의처 추출 (description에서 '문의:'로 시작하는 줄 찾기)
        let contact = '';
        if (project.description) {
            const lines = project.description.split('\n');
            const match = lines.find(line =>
                line.trim().startsWith('문의:') ||
                line.trim().startsWith('문의처:') ||
                line.trim().startsWith('문의 -') ||
                line.trim().includes('문의')
            );
            if (match) {
                contact = match.replace(/문의처?:?|-?/g, '').trim();
            }
        }
        if (!contact) contact = '총무에게 문의하세요.';
        document.getElementById('project-contact').textContent = contact;
    }

    function renderNotifications() {
        const notificationList = document.getElementById('notification-list');
        if (notificationList) {
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
    }

    function renderReport(activityId) {
        const project = state.activities.find(a => a.type === 'project' && a.id === activityId);
        if (!project) return;

        const income = project.members.filter(m => m.status === 'paid').reduce((sum, m) => sum + project.fee, 0);
        const expenses = state.activities.filter(a => a.groupId === project.groupId && a.type === 'expense');
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        const balance = income - totalExpense;

        if (modalContent) {
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
        }
        if (modal) {
            modal.classList.remove('hidden'); // hidden 제거
            modal.classList.add('visible');
        }
    }
    
    function renderExpenseDetail(activityId) {
        const expense = state.activities.find(a => a.type === 'expense' && a.id === activityId);
        if (!expense) return;

        if (modalContent) {
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
        }
        if (modal) {
            modal.classList.remove('hidden'); // hidden 제거
            modal.classList.add('visible');
        }
    }

    function showApplicantForm(projectId) {
        state.currentProjectId = projectId;
        const project = state.activities.find(a => a.id === projectId);
        const group = state.groups.find(g => g.id === project.groupId);

        document.getElementById('applicant-form-title').textContent = project.name;
        document.getElementById('applicant-form-description').textContent = project.description;
        document.getElementById('applicant-form-fee').textContent = `참가비: ${project.fee.toLocaleString()}원`;
        document.getElementById('applicant-form-group').textContent = `주최: ${group.name}`;

        // 모달 띄우기
        const applicantModal = document.getElementById('applicant-modal');
        if (applicantModal) {
            applicantModal.classList.remove('hidden');
            applicantModal.classList.add('visible');
        }
    }

    // 모달 닫기 이벤트 연결 (DOMContentLoaded 내부에 추가)
    const applicantModal = document.getElementById('applicant-modal');
    if (applicantModal) {
        applicantModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.closest('.close-modal-btn')) {
                applicantModal.classList.add('hidden');
                applicantModal.classList.remove('visible');
            }
        });
    }

    function renderApplicantStatus() {
        const project = state.activities.find(a => a.id === state.currentProjectId);
        const applicant = project.members.find(m => m.name === state.currentApplicant.name);
        
        const applicantStatusTitleEl = document.getElementById('applicant-status-title');
        if (applicantStatusTitleEl) applicantStatusTitleEl.textContent = project.name;
        const applicantStatusContentEl = document.getElementById('applicant-status-content');
        if (applicantStatusContentEl) {
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
            applicantStatusContentEl.innerHTML = statusHTML;
        }
        navigateTo('applicant-status-screen', true);
    }

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

    // --- 이벤트 리스너 등록 (안전하게 null 체크 추가) ---
    navButtons.forEach(btn => { btn.addEventListener('click', () => navigateTo(btn.dataset.target)); });
    backButtons.forEach(btn => { btn.addEventListener('click', () => {
        const currentScreenId = document.querySelector('.screen.active').id;
        
        // 현재 화면에 따라 적절한 이전 화면으로 이동
        switch(currentScreenId) {
            case 'group-detail-screen':
                navigateTo('home-screen');
                break;
            case 'project-detail-screen':
                navigateTo('group-detail-screen');
                break;
            case 'add-group-screen':
                navigateTo('home-screen');
                break;
            case 'add-activity-screen':
                navigateTo('group-detail-screen');
                break;
            case 'applicant-form-screen':
                navigateTo('project-detail-screen');
                break;
            case 'applicant-status-screen':
                navigateTo('applicant-form-screen');
                break;
            default:
                navigateTo('home-screen');
                break;
        }
    }); });
    
    // null 체크를 추가한 안전한 이벤트 리스너 등록
    const closeApplicantViewBtn = document.getElementById('close-applicant-view-btn');
    if (closeApplicantViewBtn) {
        closeApplicantViewBtn.addEventListener('click', () => navigateTo('project-detail-screen'));
    }
    
    const closeApplicantStatusBtn = document.getElementById('close-applicant-status-btn');
    if (closeApplicantStatusBtn) {
        closeApplicantStatusBtn.addEventListener('click', () => navigateTo('applicant-form-screen'));
    }
    
    // 주요 버튼 이벤트 연결
    const addGroupBtn = document.getElementById('add-group-btn');
    if (addGroupBtn) {
        addGroupBtn.addEventListener('click', () => {
            navigateTo('add-group-screen');
        });
    }

    // 하단 네비게이션 버튼 이벤트 연결
    // 하단 네비게이션 바 버튼 이벤트 연결은 DOMContentLoaded에서 한 번만 addEventListener로 연결하고, setupGlobalNavEvents 및 navigateTo에서의 반복 연결 코드는 모두 제거합니다. (SPA 구조에서 하단바는 항상 DOM에 있으므로 한 번만 연결하면 됨)
    
    if (fab) {
        fab.addEventListener('click', () => navigateTo('add-activity-screen'));
    }
    
    const addGroupForm = document.getElementById('add-group-form');
    if (addGroupForm) {
        addGroupForm.addEventListener('submit', (e) => {
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
    }
    
    const addProjectForm = document.getElementById('add-project-form');
    if (addProjectForm) {
        addProjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = e.target.querySelector('#project-name').value;
            const fee = parseInt(e.target.querySelector('#project-fee').value);
            const description = e.target.querySelector('#project-description').value;
            
            const newProject = { 
                type: 'project', id: state.nextActivityId++, groupId: state.currentGroupId, 
                name, fee, members: [], createdAt: new Date().toISOString().split('T')[0],
                virtualAccountNumber: `012-3456-7890-${state.nextActivityId}`,
                description: description
            };
            state.activities.push(newProject);
            e.target.reset();
            renderGroupDetail();
            navigateTo('group-detail-screen');
        });
    }
    
    const addExpenseForm = document.getElementById('add-expense-form');
    if (addExpenseForm) {
        addExpenseForm.addEventListener('submit', (e) => {
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
    }
    
    document.querySelectorAll('.form-tab-btn').forEach(btn => { btn.addEventListener('click', (e) => {
        document.querySelectorAll('.form-tab-btn').forEach(b => b.classList.remove('text-main-blue', 'border-main-blue'));
        e.currentTarget.classList.add('text-main-blue', 'border-main-blue');
        if (e.currentTarget.dataset.form === 'project') {
            document.getElementById('add-project-form').classList.remove('hidden');
            document.getElementById('add-expense-form').classList.add('hidden');
        } else {
            document.getElementById('add-project-form').classList.add('hidden');
            document.getElementById('add-expense-form').classList.remove('hidden');
        }
    }); });
    
    document.querySelectorAll('.tab-btn').forEach(btn => { btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('text-main-blue', 'border-main-blue'));
        e.currentTarget.classList.add('text-main-blue', 'border-main-blue');
        renderProjectDetailVertical(e.currentTarget.dataset.tab);
    }); });
    
    const addProjectMemberBtn = document.getElementById('add-project-member-btn');
    if (addProjectMemberBtn) {
        addProjectMemberBtn.addEventListener('click', () => {
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
    }
    

    
    document.querySelectorAll('.copy-account-btn').forEach(btn => { btn.addEventListener('click', (e) => {
        const container = e.currentTarget.closest('.bg-white');
        const accountInfoEl = container.querySelector('p[id*="account-number"]');
        const textToCopy = accountInfoEl.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => showToast('계좌번호가 복사되었습니다.')).catch(err => showToast('복사에 실패했습니다.', 'error'));
    }); });

    // 재정감사 버튼 이벤트
    document.addEventListener('click', (e) => {
        if (e.target.textContent === '재정감사') {
            const group = state.groups.find(g => g.id === state.currentGroupId);
            const groupActivities = state.activities.filter(a => a.groupId === state.currentGroupId);
            
            // 수입 계산
            const income = groupActivities.filter(a => a.type === 'project').reduce((sum, p) => 
                sum + p.members.filter(m => m.status === 'paid').reduce((memberSum, m) => memberSum + p.fee, 0), 0);
            
            // 지출 계산
            const outcome = groupActivities.filter(a => a.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
            
            // 잔고
            const balance = income - outcome;
            
            // 재정감사 모달 내용 생성
            const auditContent = `
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">재정감사 보고서</h2>
                    <button class="close-modal-btn text-2xl text-gray-400">&times;</button>
                </div>
                <div class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="font-bold text-lg mb-2">${group.name} 재정 현황</h3>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div><span class="text-gray-500">총 수입:</span> <span class="font-bold text-green-600">${income.toLocaleString()}원</span></div>
                            <div><span class="text-gray-500">총 지출:</span> <span class="font-bold text-red-600">${outcome.toLocaleString()}원</span></div>
                            <div><span class="text-gray-500">현재 잔고:</span> <span class="font-bold text-main-blue">${balance.toLocaleString()}원</span></div>
                            <div><span class="text-gray-500">활동 수:</span> <span class="font-bold">${groupActivities.length}건</span></div>
                        </div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="font-bold text-lg mb-2">활동별 상세 내역</h3>
                        <div class="space-y-2 text-sm">
                            ${groupActivities.map(activity => {
                                if (activity.type === 'project') {
                                    const paidCount = activity.members.filter(m => m.status === 'paid').length;
                                    const totalIncome = activity.fee * paidCount;
                                    return `<div class="flex justify-between">
                                        <span>${activity.name} (${paidCount}명)</span>
                                        <span class="text-green-600">+${totalIncome.toLocaleString()}원</span>
                                    </div>`;
                                } else {
                                    return `<div class="flex justify-between">
                                        <span>${activity.description}</span>
                                        <span class="text-red-600">-${activity.amount.toLocaleString()}원</span>
                                    </div>`;
                                }
                            }).join('')}
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button class="flex-1 bg-main-blue text-white py-2 rounded-lg text-sm font-bold" onclick="window.print()">인쇄</button>
                        <button class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold" onclick="navigator.clipboard.writeText('재정감사 보고서 내용')">복사</button>
                    </div>
                </div>
            `;
            
            modalContent.innerHTML = auditContent;
            modal.classList.add('visible');
            modal.classList.remove('hidden');
        }
    });
    
    const copyProjectLinkBtn = document.getElementById('copy-project-link-btn');
    if (copyProjectLinkBtn) {
        copyProjectLinkBtn.addEventListener('click', () => {
            const link = `https://modu-chongmu.app/apply?id=${state.currentProjectId}`;
            navigator.clipboard.writeText(link).then(() => {
                showToast('참가 신청 링크가 복사되었습니다.');
            });
        });
    }
    
    const checkProjectLinkBtn = document.getElementById('check-project-link-btn');
    if (checkProjectLinkBtn) {
        checkProjectLinkBtn.addEventListener('click', () => {
            // 신청자 전용 화면으로 이동 및 정보 채우기
            const project = state.activities.find(a => a.id === state.currentProjectId);
            const group = state.groups.find(g => g.id === project.groupId);
            document.getElementById('apply-form-title').textContent = project.name;
            document.getElementById('apply-form-date').textContent = project.createdAt ? `일시: ${project.createdAt}` : '';
            document.getElementById('apply-form-description').textContent = project.description || '';
            document.getElementById('apply-form-fee').textContent = `${project.fee.toLocaleString()}원`;
            document.getElementById('apply-form-account').textContent = project.virtualAccountNumber ? `${project.virtualAccountNumber} (가상계좌)` : '';
            document.getElementById('apply-form-group').textContent = group.name;
            // 문의처 추출 (description에서 '문의:'로 시작하는 줄 찾기)
            let contact = '';
            if (project.description) {
                const match = project.description.split('\n').find(line => line.trim().startsWith('문의:'));
                if (match) contact = match.replace('문의:', '').trim();
            }
            document.getElementById('apply-form-contact').textContent = contact;
            navigateTo('apply-screen', true);
        });
    }

    // 닫기(X) 버튼 이벤트
    const closeApplyBtn = document.querySelector('.close-apply-btn');
    if (closeApplyBtn) {
        closeApplyBtn.addEventListener('click', () => {
            navigateTo('project-detail-screen');
        });
    }

    // 신청 폼 제출 이벤트
    const applyFormSpa = document.getElementById('apply-form-spa');
    if (applyFormSpa) {
        applyFormSpa.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('apply-applicant-name').value;
            const contact = document.getElementById('apply-applicant-contact').value;
            showToast(`${name}님(${contact}), 신청이 완료되었습니다!`);
            navigateTo('project-detail-screen');
        });
    }
    
    const settlementRequestBtn = document.getElementById('settlement-request-btn');
    if (settlementRequestBtn) {
        settlementRequestBtn.addEventListener('click', () => {
            const project = state.activities.find(p => p.id === state.currentProjectId);
            const unpaidMembers = project.members.filter(m => m.status === 'unpaid');
            
            if (unpaidMembers.length === 0) {
                showToast('모든 멤버가 정산을 완료했습니다!', 'info');
                return;
            }
            
            // 정산 요청 모달 내용 생성
            const requestContent = `
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">정산 요청</h2>
                    <button class="close-modal-btn text-2xl text-gray-400">&times;</button>
                </div>
                <div class="space-y-4">
                    <div class="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 class="font-bold text-lg mb-2">${project.name}</h3>
                        <p class="text-sm text-gray-600">미정산 멤버: ${unpaidMembers.length}명</p>
                        <p class="text-sm text-gray-600">정산 금액: ${project.fee.toLocaleString()}원</p>
                    </div>
                    <div class="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 class="font-bold text-lg mb-2">미정산 멤버 목록</h3>
                        <div class="space-y-3 text-sm">
                            ${unpaidMembers.map(member => `
                                <div class="flex justify-between items-center p-2 bg-white rounded">
                                    <span class="font-semibold">${member.name}</span>
                                    <span class="text-orange-600">${member.feeToPay.toLocaleString()}원</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button class="flex-1 bg-main-blue text-white py-2 rounded-lg text-sm font-bold" onclick="sendSettlementRequest()">정산 요청 발송</button>
                        <button class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold" onclick="copySettlementMessage()">메시지 복사</button>
                    </div>
                </div>
            `;
            
            modalContent.innerHTML = requestContent;
            modal.classList.add('visible');
            modal.classList.remove('hidden');
        });
    }
    
    // 정산 요청 발송 함수
    window.sendSettlementRequest = function() {
        const project = state.activities.find(p => p.id === state.currentProjectId);
        const unpaidMembers = project.members.filter(m => m.status === 'unpaid');
        const memberNames = unpaidMembers.map(m => m.name).join(', ');
        
        showToast(`정산 요청이 ${unpaidMembers.length}명에게 발송되었습니다!`);
        modal.classList.remove('visible');
        modal.classList.add('hidden');
    };
    
    // 정산 요청 메시지 복사 함수
    window.copySettlementMessage = function() {
        const project = state.activities.find(p => p.id === state.currentProjectId);
        const unpaidMembers = project.members.filter(m => m.status === 'unpaid');
        const memberNames = unpaidMembers.map(m => m.name).join(', ');
        
        const message = `[${project.name}] 정산 요청\n\n미정산 멤버: ${memberNames}\n정산 금액: ${project.fee.toLocaleString()}원\n\n계좌번호: ${project.virtualAccountNumber || '문의 바랍니다'}`;
        
        navigator.clipboard.writeText(message).then(() => {
            showToast('정산 요청 메시지가 복사되었습니다!');
        });
    };
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.closest('.close-modal-btn')) {
                modal.classList.remove('visible');
            }
        });
    }
    
    const applyForm = document.getElementById('apply-form');
    if (applyForm) {
        applyForm.addEventListener('submit', (e) => {
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
    }
    
    const applicantStatusContent = document.getElementById('applicant-status-content');
    if (applicantStatusContent) {
        applicantStatusContent.addEventListener('click', (e) => {
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
    }

    function setupGlobalNavEvents() {
        // 하단 네비게이션 바 버튼 이벤트 연결은 DOMContentLoaded에서 한 번만 addEventListener로 연결하고, setupGlobalNavEvents 및 navigateTo에서의 반복 연결 코드는 모두 제거합니다. (SPA 구조에서 하단바는 항상 DOM에 있으므로 한 번만 연결하면 됨)
    }

    function setupHomeScreenEvents() {
        // 모임 만들기 버튼
        const addGroupBtn = document.getElementById('add-group-btn');
        if (addGroupBtn) {
            addGroupBtn.onclick = () => navigateTo('add-group-screen');
        }
        // 모임 카드 클릭
        document.querySelectorAll('[data-group-id]').forEach(card => {
            card.onclick = () => {
                state.currentGroupId = parseInt(card.dataset.groupId);
                renderGroupDetail();
                navigateTo('group-detail-screen');
            };
        });
    }

    function setupFabEvent() {
        const fab = document.getElementById('add-activity-fab');
        if (fab && !fab._eventAttached) {
            fab.addEventListener('click', () => {
                navigateTo('add-activity-screen');
            });
            fab._eventAttached = true;
        }
    }

    // navigateTo 오버라이드
    const _navigateTo = navigateTo;
    navigateTo = function(screenId, isApplicantView = false) {
        _navigateTo(screenId, isApplicantView);
        if (screenId === 'home-screen') {
            renderGroups();
            setupHomeScreenEvents();
        }
        setupGlobalNavEvents();
        setupFabEvent(); // 플로팅 버튼 이벤트 항상 연결
        if (typeof fab !== 'undefined' && fab) {
            fab.style.display = (screenId === 'group-detail-screen') ? 'flex' : 'none';
        }
    };

    // --- 초기화 ---
    renderGroups();
    renderNotifications();
    setupHomeScreenEvents();
    setupGlobalNavEvents();
    setupFabEvent();
    if (fab) fab.style.display = 'none';
    // 하단 네비게이션 바 버튼 이벤트 연결 (한 번만)
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('data-target');
            if (target) navigateTo(target);
        });
    });

    const dailyLedgerBtn = document.getElementById('daily-ledger-btn');
    if (dailyLedgerBtn) {
        dailyLedgerBtn.addEventListener('click', () => {
            const project = state.activities.find(p => p.id === state.currentProjectId);
            const group = state.groups.find(g => g.id === project.groupId);
            
            // 해당 프로젝트의 내역만 필터링
            const projectActivities = state.activities.filter(a => 
                (a.type === 'project' && a.id === project.id) || 
                (a.type === 'expense' && a.groupId === project.groupId && 
                 new Date(a.createdAt) >= new Date(project.createdAt))
            );
            
            // 날짜별로 정렬
            const sortedActivities = projectActivities.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            
            // 일일거래장부 모달 내용 생성
            const ledgerContent = `
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">일일거래장부</h2>
                    <button class="close-modal-btn text-2xl text-gray-400">&times;</button>
                </div>
                <div class="space-y-4">
                    <div class="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 class="font-bold text-lg mb-2">${group.name} - ${project.name}</h3>
                        <p class="text-sm text-gray-600">계좌번호: ${group.accountNumber}</p>
                        <p class="text-sm text-gray-600">예금주: ${group.accountHolder}</p>
                    </div>
                    <div class="bg-white p-4 rounded-lg border border-gray-200">
                        <h3 class="font-bold text-lg mb-2">거래 내역</h3>
                        <div class="space-y-3 text-sm">
                            ${sortedActivities.map(activity => {
                                const date = new Date(activity.createdAt).toLocaleDateString('ko-KR');
                                if (activity.type === 'project') {
                                    // 입금자별로 개별 내역 표시
                                    const paidMembers = activity.members.filter(m => m.status === 'paid');
                                    if (paidMembers.length > 0) {
                                        return paidMembers.map(member => 
                                            `<div class="flex justify-between items-center p-2 bg-white rounded">
                                                <div>
                                                    <div class="font-semibold">${date}</div>
                                                    <div class="text-gray-600">${activity.name} - ${member.name} 입금</div>
                                                </div>
                                                <span class="font-bold text-green-600">+${activity.fee.toLocaleString()}원</span>
                                            </div>`
                                        ).join('');
                                    } else {
                                        return `<div class="flex justify-between items-center p-2 bg-white rounded">
                                            <div>
                                                <div class="font-semibold">${date}</div>
                                                <div class="text-gray-600">${activity.name} - 입금 대기중</div>
                                            </div>
                                            <span class="font-bold text-gray-500">0원</span>
                                        </div>`;
                                    }
                                } else {
                                    return `<div class="flex justify-between items-center p-2 bg-white rounded">
                                        <div>
                                            <div class="font-semibold">${date}</div>
                                            <div class="text-gray-600">${activity.description}</div>
                                        </div>
                                        <span class="font-bold text-red-600">-${activity.amount.toLocaleString()}원</span>
                                    </div>`;
                                }
                            }).join('')}
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <button class="flex-1 bg-main-blue text-white py-2 rounded-lg text-sm font-bold" onclick="window.print()">인쇄</button>
                        <button class="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold" onclick="navigator.clipboard.writeText('일일거래장부 내용')">복사</button>
                    </div>
                </div>
            `;
            
            modalContent.innerHTML = ledgerContent;
            modal.classList.add('visible');
            modal.classList.remove('hidden');
        });
    }
});
