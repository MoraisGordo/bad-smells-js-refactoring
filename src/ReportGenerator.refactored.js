const REPORT_TYPES = {
  CSV: 'CSV',
  HTML: 'HTML',
};

const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

const USER_MAX_VALUE = 500;
const PRIORITY_VALUE = 1000;

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const visibleItems = this.filterItemsByUser(user, items);
    const total = this.calculateTotal(visibleItems);

    let report = this.generateHeader(reportType, user);

    for (const item of visibleItems) {
      report += this.generateItemLine(reportType, item, user);
    }

    report += this.generateFooter(reportType, total);

    return report.trim();
  }

  filterItemsByUser(user, items) {
    if (user.role === USER_ROLES.ADMIN) {
      return items.map((item) => ({
        ...item,
        priority: item.value > PRIORITY_VALUE,
      }));
    }

    return items.filter((item) => item.value <= USER_MAX_VALUE);
  }

  calculateTotal(items) {
    return items.reduce((total, item) => total + item.value, 0);
  }

  generateHeader(reportType, user) {
    if (reportType === REPORT_TYPES.CSV) {
      return 'ID,NOME,VALOR,USUARIO\n';
    }

    return (
      '<html><body>\n' +
      '<h1>Relatório</h1>\n' +
      `<h2>Usuário: ${user.name}</h2>\n` +
      '<table>\n' +
      '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n'
    );
  }

  generateItemLine(reportType, item, user) {
    if (reportType === REPORT_TYPES.CSV) {
      return `${item.id},${item.name},${item.value},${user.name}\n`;
    }

    return this.generateHtmlRow(item);
  }

  generateHtmlRow(item) {
    const style = item.priority
      ? ' style="font-weight:bold;"'
      : '';

    return (
      `<tr${style}>` +
      `<td>${item.id}</td>` +
      `<td>${item.name}</td>` +
      `<td>${item.value}</td>` +
      '</tr>\n'
    );
  }

  generateFooter(reportType, total) {
    if (reportType === REPORT_TYPES.CSV) {
      return `\nTotal,,\n${total},,\n`;
    }

    return (
      '</table>\n' +
      `<h3>Total: ${total}</h3>\n` +
      '</body></html>\n'
    );
  }
}