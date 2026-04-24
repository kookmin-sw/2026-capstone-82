// ===================================================================
// Mission: Immigration Registration (출입국관리사무소)
// Task: Apply for an Alien Registration Card (ARC) at the immigration office
// ===================================================================

const immigrationMission = {
  id: 'immigration',
  title: '출입국관리사무소 — Immigration Office',
  background: 'images/Immigration_waiting.png',

  helperContext: `The player is at a Korean Immigration Office (출입국관리사무소) to apply for an Alien Registration Card (외국인등록증, ARC).
Foreigners staying in Korea longer than 90 days MUST get an ARC within 90 days of arrival.
Required documents: passport, visa, 1 passport photo, application form, proof of address, tuition receipt (for students), and fee (~30,000 KRW).
The process:
1. Take a number ticket at the entrance
2. Wait for your number to be called
3. Submit documents to the officer
4. Pay the fee
5. Fingerprints and photo are taken on site
6. The card is mailed to your address in 2-4 weeks
Polite speech (존댓말) is essential. Be patient — wait times can be long.`,

  steps: {
    start: {
      text: '(출입국관리사무소에 도착했다)\n안내원: 안녕하세요. 어떤 업무로 오셨나요?',
      choices: [
        { label: '외국인 등록을 하러 왔어요.', next: 'takeNumber' },
        { label: '처음이라 잘 모르겠어요.', next: 'explain' }
      ]
    },

    explain: {
      text: '안내원: 괜찮아요. 외국인 등록이시면, 저기서 번호표를 뽑고 기다리시면 됩니다.',
      choices: [
        { label: '감사합니다!', next: 'takeNumber' }
      ]
    },

    takeNumber: {
      text: '(번호표를 뽑았다: 42번)\n(대기실에서 기다린다...)',
      choices: [
        { label: '(기다린다)', next: 'called' }
      ]
    },

    called: {
      text: '"42번 고객님, 3번 창구로 와주세요."',
      background: 'images/Immigration_RegDesk.png',
      choices: [
        { label: '(창구로 간다)', next: 'submitDocs' }
      ]
    },

    submitDocs: {
      text: '직원: 안녕하세요. 외국인 등록 신청서와 여권을 주시겠어요?',
      background: 'images/Immigration_RegDesk.png',
      choices: [
        { label: '(서류와 여권을 건넨다)', next: 'checkDocs' }
      ]
    },

    checkDocs: {
      text: '직원: 사진 한 장과 주소 증명서도 필요합니다. 가지고 오셨나요?',
      background: 'images/Immigration_RegDesk.png',
      choices: [
        { label: '네, 여기 있습니다.', next: 'fee' },
        { label: '사진은 있는데 주소 증명은…', next: 'helpAddress' }
      ]
    },

    helpAddress: {
      text: '직원: 기숙사 증명서나 임대 계약서도 괜찮아요.',
      background: 'images/Immigration_RegDesk.png',
      choices: [
        { label: '아, 기숙사 증명서 있습니다!', next: 'fee' }
      ]
    },

    fee: {
      text: '직원: 수수료 30,000원 납부 부탁드립니다.',
      background: 'images/Immigration_RegDesk.png',
      choices: [
        { label: '(카드로 결제한다)', next: 'fingerprint' },
        { label: '(현금으로 지불한다)', next: 'fingerprint' }
      ]
    },

    fingerprint: {
      text: '직원: 이제 지문과 사진을 찍겠습니다. 이쪽으로 오세요.',
      background: 'images/Immigration_RegDesk.png',
      choices: [
        { label: '(지문을 찍고 사진을 찍는다)', next: 'done' }
      ]
    },

    done: {
      text: '직원: 신청이 완료되었습니다! 카드는 2-4주 안에 주소지로 발송됩니다.',
      background: 'images/Immigration_RegDesk.png',
      choices: [
        { label: '[미션 완료] 메뉴로 돌아가기', next: 'END' }
      ]
    }
  },

  completeTitle: '🏛️ 외국인 등록 완료!',
  completeMessage: '외국인 등록 신청을 성공적으로 완료했습니다!'
};
