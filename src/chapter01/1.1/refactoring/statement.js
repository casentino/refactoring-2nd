const invoices = require("../invoices.json");
const plays = require("../plays.json");
function statement(invoice, plays) {
  // aPerformance를 통해 play 를 얻으므로
  // amountFor 내부에서 다시 계산도 가능하다
  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }
  // perf -> aPerformance
  // 매개변수가 역할이 뚜렷하지 않은 경우 부정관사(a/an)를 붙임
  function amountFor(aPerformance) {
    // statement 함수 내부에서 선언된 amountFor에서 playFor 를 직접 호출가능해서 play 매개변수 재거
    let result = 0;
    switch (playFor(aPerformance).type) {
      case "tragedy": // 비극
        result = 40000;
        if (aPerformance.audience > 30) {
          result += 1000 * (aPerformance.audience - 30);
        }
        break;
      case "comedy": // 희극
        result = 30000;
        if (aPerformance.audience > 20) {
          result += 10000 + 500 * (aPerformance.audience - 20);
        }
        result += 300 * aPerformance.audience;
        break;
      default:
        throw new Error(`알 수 없는 장르: ${playFor(aPerformance).type}`);
    }
    return result;
  }

  let totalAmount = 0;
  let volumeCredits = 0;
  let result = `청구 내역 (고객명: ${invoice.customer})\n`;
  const format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format;

  for (let perf of invoice.performances) {    
    // 지역 변수 제거 
    // 스코프를 신경써야 할 대상이 줄어듬 
    // let thisAmount = amountFor(perf);

    // 포인트 적립한다.
    volumeCredits += Math.max(perf.audience - 30, 0);
    // 희극 관객 5명마다 추가 포인트를 제공한다.
    if ("comedy" === playFor(perf).type) volumeCredits += Math.floor(perf.audience / 5);

    //청구 내역을 출력한다.
    result += ` ${playFor(perf).name}: ${format(amountFor(perf) / 100)} (${perf.audience}석)\n`;
    totalAmount += amountFor(perf);
  }
  result += `총액: ${format(totalAmount / 100)}\n`;
  result += `적립 포인트: ${volumeCredits}점\n`;
  return result;

}

console.log(statement(invoices[0], plays));
