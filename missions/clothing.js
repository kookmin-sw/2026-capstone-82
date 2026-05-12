const clothingMission = {
  id: 'clothing',
  title: '옷 가게 환불/교환',
  background: 'images/clothing_store.png',
  helperContext: `The player bought a jacket 3 days ago and needs to return or exchange it due to wrong size.
Korean store policy: 7 days return/exchange window; item must have tags intact and no signs of wear.
영수증 (receipt) is required. Without it, card payment history can be used as proof.
Cash payments with no receipt cannot be returned.
환불 (refund): money returned to original payment method (card refund takes 3–5 business days).
교환 (exchange): swap for different size or colour.
Tax Refund: foreign tourists can reclaim VAT on purchases over 30,000 KRW by getting a Tax Refund receipt,
 getting a customs stamp at the airport, then collecting the refund at the airport refund counter.
When refunding, any Tax Refund receipt for that purchase becomes void and must be returned.`,
  vocabulary: [
    { kr: '환불', en: 'refund', rom: 'hwanbul' },
    { kr: '교환', en: 'exchange', rom: 'gyohwan' },
    { kr: '영수증', en: 'receipt', rom: 'yeongsujeung' },
    { kr: '사이즈', en: 'size', rom: 'saijeu' },
    { kr: '택', en: 'price/clothing tag', rom: 'taek' },
    { kr: '세금 환급', en: 'tax refund', rom: 'segeum hwanggeup' },
    { kr: '부가세', en: 'VAT (value-added tax)', rom: 'bugase' },
  ],
  completeTitle: '👗 환불/교환 완료!',
  completeMessage: '옷 가게에서 환불/교환을 성공적으로 처리했습니다!',
  images: ['images/clothing_store.png', 'images/clothing_counter.png'],
  sceneFn() {
    const scenes = {};
    const go = name => { clearChoices(); scenes[name](); };
    const enterGo = name => waitEnterThen(() => go(name));
    const bg = img => changeBackground('images/' + img);

    let wantsRefund = true;
    let hasTaxReceipt = false;

    scenes.start = () => {
      bg('clothing_store.png');
      typeText('주인공: 3일 전에 산 옷이 사이즈가 안 맞아...\n옷 가게에 가서 처리해야겠다.', () => enterGo('arrive'));
    };
    scenes.arrive = () => {
      bg('clothing_counter.png');
      typeText('(옷 가게에 도착했다)\n\n직원: 안녕하세요! 어서오세요. 무엇을 도와드릴까요?', () => {
        addChoice('3일 전에 산 옷을 환불하고 싶어요.', '1');
        addChoice('3일 전에 산 옷을 교환하고 싶어요.', '2');
        addChoice('이 옷 사이즈가 안 맞는데요...', '3');
      });
      waitForChoice(c => {
        if (c === '1') { wantsRefund = true; go('askReceipt'); }
        else if (c === '2') { wantsRefund = false; go('askReceipt'); }
        else go('whatToDo');
      });
    };
    scenes.whatToDo = () => {
      bg('clothing_store.png');
      typeText('직원: 아, 사이즈가 안 맞으셨군요!\n환불을 원하세요, 아니면 다른 사이즈로 교환하시겠어요?', () => {
        addChoice('환불해 주세요.', '1');
        addChoice('다른 사이즈로 교환해 주세요.', '2');
      });
      waitForChoice(c => { wantsRefund = c === '1'; go('askReceipt'); });
    };
    scenes.askReceipt = () => {
      bg('clothing_counter.png');
      const action = wantsRefund ? '환불' : '교환';
      typeText(`직원: 알겠습니다! 혹시 영수증을 가져오셨나요?\n${action} 시 영수증이 필요합니다.`, () => {
        addChoice('네, 영수증 가져왔습니다!', '1');
        addChoice('영수증이 어디 있지... (가방을 뒤진다)', '2');
        addChoice('영수증을 안 가져왔는데요...', '3');
      });
      waitForChoice(c => {
        if (c === '1') go('checkReceipt');
        else if (c === '2') go('searchBag');
        else go('noReceipt');
      });
    };
    scenes.searchBag = () => {
      bg('clothing_counter.png');
      typeText('(가방을 뒤진다...)\n\n주인공: 아, 여기 있었네요!', () => addChoice('(영수증을 건넨다)', '1'));
      waitForChoice(() => go('checkReceipt'));
    };
    scenes.noReceipt = () => {
      bg('clothing_counter.png');
      const action = wantsRefund ? '환불' : '교환';
      typeText(`직원: 영수증이 없으시면 ${action}이 어려울 수 있어요.\n혹시 카드로 결제하셨나요? 카드 내역으로 확인 가능합니다.`, () => {
        addChoice('카드로 결제했어요!', '1');
        addChoice('현금으로 결제했는데요...', '2');
      });
      waitForChoice(c => { if (c === '1') go('cardVerify'); else go('noProof'); });
    };
    scenes.cardVerify = () => {
      bg('clothing_counter.png');
      typeText('직원: 카드 내역으로 확인할게요.\n(단말기를 확인한다)\n\n3일 전 결제 내역 확인! ✅', () => enterGo('checkCondition'));
    };
    scenes.noProof = () => {
      bg('clothing_counter.png');
      const action = wantsRefund ? '환불' : '교환';
      typeText(`직원: 죄송합니다. 영수증이나 카드 결제 내역이 없으면\n${action}이 어렵습니다.\n\n다음에 영수증을 꼭 챙겨오세요!`, () => {
        addChoice('알겠습니다... 다음에 올게요.', '1');
      });
      waitForChoice(() => go('failEnd'));
    };
    scenes.failEnd = () => {
      bg('clothing_store.png');
      typeText('주인공: 다음부터는 영수증을 꼭 챙겨야겠다!\n\n💡 팁: 구매 후 영수증은 최소 7일간 보관하세요!', showMissionComplete);
    };
    scenes.checkReceipt = () => {
      bg('clothing_counter.png');
      const action = wantsRefund ? '환불' : '교환';
      typeText(`직원: (영수증을 확인한다)\n\n🧾 구매일: 3일 전\n👗 상품: 자켓 (M사이즈)\n💰 금액: 89,000원\n\n구매일로부터 7일 이내이므로 ${action} 가능합니다!`, () => enterGo('checkCondition'));
    };
    scenes.checkCondition = () => {
      bg('clothing_counter.png');
      typeText('직원: 상품 상태를 확인할게요.\n택(tag)이 붙어 있고, 착용 흔적이 없어야 합니다.', () => {
        addChoice('(옷을 건넨다) 택도 그대로 있어요!', '1');
        addChoice('(옷을 건넨다)', '2');
      });
      waitForChoice(() => go('conditionOk'));
    };
    scenes.conditionOk = () => {
      bg('clothing_counter.png');
      typeText('직원: (상품을 확인한다)\n\n✅ 택(tag) 부착 상태 확인\n✅ 착용 흔적 없음\n✅ 오염 없음\n\n상품 상태 양호합니다!', () => enterGo(wantsRefund ? 'refundProcess' : 'exchangeProcess'));
    };

    // ── 환불 ────────────────────────────────────────────
    scenes.refundProcess = () => {
      bg('clothing_counter.png');
      typeText('직원: 환불을 진행하겠습니다.\n결제하신 방법으로 환불해 드릴게요.\n\n어떤 방법으로 결제하셨나요?', () => {
        addChoice('카드로 결제했어요.', '1');
        addChoice('현금으로 결제했어요.', '2');
      });
      waitForChoice(c => { if (c === '1') go('cardRefund'); else go('cashRefund'); });
    };
    scenes.cardRefund = () => {
      bg('clothing_counter.png');
      typeText('직원: 카드 환불을 진행합니다.\n카드를 단말기에 대주세요.', () => addChoice('(카드를 댄다)', '1'));
      waitForChoice(() => go('cardRefundDone'));
    };
    scenes.cardRefundDone = () => {
      bg('clothing_counter.png');
      typeText('직원: 카드 환불 완료! ✅\n89,000원이 카드로 환불됩니다.\n\n⚠️ 카드 환불은 3~5영업일 소요될 수 있어요.', () => enterGo('askTaxRefund'));
    };
    scenes.cashRefund = () => {
      bg('clothing_counter.png');
      typeText('직원: 현금 환불을 진행합니다.\n\n(현금 89,000원을 건넨다)\n\n직원: 여기 89,000원입니다. 확인해 주세요.', () => addChoice('(금액을 확인한다) 맞습니다!', '1'));
      waitForChoice(() => go('askTaxRefund'));
    };

    // ── 교환 ────────────────────────────────────────────
    scenes.exchangeProcess = () => {
      bg('clothing_counter.png');
      typeText('직원: 교환을 진행하겠습니다.\n같은 상품의 다른 사이즈로 교환해 드릴까요?', () => {
        addChoice('네, 한 사이즈 큰 걸로 주세요. (L사이즈)', '1');
        addChoice('네, 한 사이즈 작은 걸로 주세요. (S사이즈)', '2');
        addChoice('다른 색상으로 교환할 수 있나요?', '3');
      });
      waitForChoice(c => { if (c === '3') go('colorExchange'); else go('sizeExchange'); });
    };
    scenes.colorExchange = () => {
      bg('clothing_counter.png');
      typeText('직원: 네, 같은 가격의 다른 색상으로도 교환 가능해요!\n어떤 색상을 원하세요?', () => {
        addChoice('검은색으로 주세요.', '1');
        addChoice('흰색으로 주세요.', '2');
      });
      waitForChoice(() => go('exchangeCheck'));
    };
    scenes.sizeExchange = () => {
      bg('clothing_counter.png');
      typeText('직원: 잠깐만요, 재고를 확인할게요.\n\n(재고를 확인한다)\n\n직원: 재고 있습니다! ✅', () => enterGo('exchangeCheck'));
    };
    scenes.exchangeCheck = () => {
      bg('clothing_counter.png');
      typeText('직원: 새 상품을 가져왔습니다.\n한번 확인해 보세요!', () => {
        addChoice('(상품을 확인한다) 좋아요!', '1');
        addChoice('(사이즈를 확인한다) 이거면 딱 맞겠네요!', '2');
      });
      waitForChoice(() => go('exchangeDone'));
    };
    scenes.exchangeDone = () => {
      bg('clothing_counter.png');
      typeText('직원: 교환 완료! ✅\n새 영수증을 발급해 드릴게요.\n\n(새 영수증을 건넨다)', () => enterGo('askTaxRefund'));
    };

    // ── Tax Refund ────────────────────────────────────
    scenes.askTaxRefund = () => {
      bg('clothing_counter.png');
      if (wantsRefund) {
        typeText('직원: 참, 혹시 이 상품 구매 시\nTax Refund(세금 환급) 영수증을 받으셨나요?\n\n⚠️ 환불하시면 해당 구매가 취소되므로\nTax Refund 영수증도 무효가 됩니다.', () => {
          addChoice('네, Tax Refund 영수증이 있어요.', '1');
          addChoice('아니요, 받지 않았어요.', '2');
          addChoice('Tax Refund 영수증이 뭔가요?', '3');
        });
        waitForChoice(c => {
          if (c === '1') go('returnTaxReceipt');
          else if (c === '2') go('noTaxReceipt');
          else go('explainTaxRefund');
        });
      } else {
        typeText('직원: 참, 혹시 외국인이세요?\n외국인 관광객이시라면 세금 환급(Tax Refund)을 받으실 수 있어요!', () => {
          addChoice('네, 외국인이에요! 세금 환급이 뭔가요?', '1');
          addChoice('네, Tax Refund 영수증도 챙기고 싶어요!', '2');
          addChoice('아니요, 괜찮아요.', '3');
        });
        waitForChoice(c => {
          if (c === '1') go('explainTax');
          else if (c === '2') { hasTaxReceipt = true; go('taxReceipt'); }
          else go('complete');
        });
      }
    };
    scenes.returnTaxReceipt = () => {
      bg('clothing_counter.png');
      typeText('직원: Tax Refund 영수증을 제출해 주세요.\n환불 처리와 함께 세금 환급 기록도 취소하겠습니다.', () => addChoice('(영수증을 건넨다)', '1'));
      waitForChoice(() => go('taxCancelled'));
    };
    scenes.taxCancelled = () => {
      bg('clothing_counter.png');
      typeText('직원: Tax Refund 영수증 회수 완료! ✅\n세금 환급 기록이 취소되었습니다.\n\n💡 환불하면 해당 구매의 Tax Refund도 무효가 돼요.', () => enterGo('complete'));
    };
    scenes.noTaxReceipt = () => {
      bg('clothing_counter.png');
      typeText('직원: 알겠습니다. Tax Refund 영수증을 받지 않으셨으면\n별도 처리 없이 환불 진행하겠습니다!', () => enterGo('complete'));
    };
    scenes.explainTaxRefund = () => {
      bg('clothing_counter.png');
      typeText('직원: Tax Refund 영수증은 외국인 관광객이\n3만원 이상 구매 시 부가세를 환급받기 위한 서류예요.\n\n환불하시면 구매 자체가 취소되므로\nTax Refund 영수증도 무효가 됩니다.\n\n혹시 받으신 적 있으세요?', () => {
        addChoice('아, 그렇군요. 영수증이 있어요!', '1');
        addChoice('받은 적 없어요.', '2');
      });
      waitForChoice(c => { if (c === '1') go('returnTaxReceipt'); else go('noTaxReceipt'); });
    };
    scenes.explainTax = () => {
      bg('clothing_counter.png');
      typeText('직원: 한국에서 3만원 이상 구매하시면\n부가세(VAT)를 환급받을 수 있어요!\n\n📋 방법:\n1. 매장에서 Tax Refund 영수증을 받으세요\n2. 출국 시 공항 세관에서 도장을 받으세요\n3. 공항 환급 카운터에서 환급받으세요\n\n영수증을 발급해 드릴까요?', () => {
        addChoice('네, 발급해 주세요!', '1');
        addChoice('아니요, 괜찮아요.', '2');
      });
      waitForChoice(c => { if (c === '1') { hasTaxReceipt = true; go('taxReceipt'); } else go('complete'); });
    };
    scenes.taxReceipt = () => {
      bg('clothing_counter.png');
      typeText('직원: Tax Refund 영수증을 발급해 드릴게요.\n여권을 보여주세요.', () => addChoice('(여권을 건넨다)', '1'));
      waitForChoice(() => go('taxReceiptDone'));
    };
    scenes.taxReceiptDone = () => {
      bg('clothing_counter.png');
      typeText('직원: Tax Refund 영수증 발급 완료! ✅\n\n⚠️ 출국 시 꼭 챙겨가세요!\n공항 세관에서 도장 받은 후 환급 카운터에서 환급받으실 수 있어요.', () => enterGo('complete'));
    };

    // ── 완료 ─────────────────────────────────────────
    scenes.complete = () => {
      bg('clothing_counter.png');
      const action = wantsRefund ? '환불' : '교환';
      let msg = `직원: ${action} 처리가 완료되었습니다! 감사합니다.\n주인공: 감사합니다! 도움이 많이 됐어요!\n\n`;
      msg += '💡 팁:\n• 구매 후 영수증은 꼭 보관하세요\n• 보통 7일 이내 환불/교환 가능\n• 택(tag)을 제거하지 마세요';
      if (wantsRefund) msg += '\n• 환불 시 Tax Refund 영수증도 함께 반납하세요';
      if (hasTaxReceipt && !wantsRefund) msg += '\n• Tax Refund 영수증은 출국 시 꼭 챙기세요!';
      typeText(msg, showMissionComplete);
    };

    go('start');
  }
};
