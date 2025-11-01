// src/utils/sanitizers/HtmlSanitizer.ts

// Lista de tags HTML permitidas para serem renderizadas. Todas as outras serão removidas.
const ALLOWED_TAGS = ['STRONG', 'BR'];

/**
 * Percorre a árvore DOM de um nó.
 * @param node O nó inicial.
 * @param func A função a ser executada em cada nó.
 */
function walkTheDOM(node: Node | null, func: (n: Node) => void) {
    if (!node) return;
    func(node);
    let currentNode = node.firstChild;
    while (currentNode) {
        walkTheDOM(currentNode, func);
        currentNode = currentNode.nextSibling;
    }
}

/**
 * Sanitiza uma string de HTML para remover todas as tags exceto as da lista de permissão.
 * Esta é uma medida de segurança para prevenir XSS ao usar `dangerouslySetInnerHTML`.
 * @param dirtyHtml A string de HTML potencialmente "suja".
 * @returns Uma string de HTML "limpa", contendo apenas as tags permitidas.
 */
export const sanitizeHtml = (dirtyHtml: string): string => {
    // Utiliza a API nativa do navegador (DOMParser) para criar um documento HTML temporário.
    // Isso é mais seguro e robusto do que usar expressões regulares para manipular HTML.
    const doc = new DOMParser().parseFromString(dirtyHtml, 'text/html');
    const nodesToProcess: Element[] = [];

    // Percorre a árvore de nós e coleta todos os elementos que não são permitidos.
    walkTheDOM(doc.body, (node) => {
        if (node.nodeType === Node.ELEMENT_NODE && !ALLOWED_TAGS.includes(node.nodeName)) {
            nodesToProcess.push(node as Element);
        }
    });

    // Processa os nós marcados para remoção, substituindo-os por seus filhos.
    // Isso "desembrulha" o conteúdo de tags indesejadas, preservando o texto.
    nodesToProcess.forEach(node => {
        const parent = node.parentNode;
        if (parent) {
            while (node.firstChild) {
                parent.insertBefore(node.firstChild, node);
            }
            parent.removeChild(node);
        }
    });

    return doc.body.innerHTML;
};
