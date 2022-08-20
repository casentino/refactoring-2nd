const invoices = require("../invoices.json");
const plays = require("../plays.json");

function statement(invoice, plays) {
  const statementData = {};  
  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances.map(enrichPerformance);
  
  function enrichPerformance(aPerformance) { 
    const result = Object.assign({}, aPerformance);
    result.play = playFor(result);
    return result;
  }
  function playFor(aPerformance) {
    return plays[aPerformance.playID];
  }
  return renderPlainText(statementData, invoice, plays);
}

function renderPlainText(data, plays) {
  function amountFor(aPerformance) {
    let result = 0;
    switch (aPerformance.play.type) {
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
        throw new Error(`알 수 없는 장르: ${aPerformance.play.type}`);
    }
    return result;
  }
  function volumeCreditsFor(aPerformance) {
    let result = 0;
    result += Math.max(aPerformance.audience - 30, 0);
    // 희극 관객 5명마다 추가 포인트를 제공한다.
    if ("comedy" === aPerformance.play.type) {
      result += Math.floor(aPerformance.audience / 5);
    }
    return result;
  }
  function usd(aNumber) { 
    return  new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(aNumber / 100);
  }
  function totalVolumeCredits() { 
    let result = 0;
    for (let perf of data.performances) {
      result += volumeCreditsFor(perf);
    }
    return result;
  }
  function totalAmount() { 
    let result = 0;
    for (let perf of data.performances) {
       result += amountFor(perf);
    }
    return result;
  }
  
  let result = `청구 내역 (고객명: ${data.customer})\n`;  

  for (let perf of data.performances) {    
    //청구 내역을 출력한다.
    result += ` ${perf.play.name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;  
  }
  result += `총액: ${usd(totalAmount())}\n`;
  result += `적립 포인트: ${totalVolumeCredits()}점\n`;
  return result;

}

console.log(statement(invoices[0], plays));
