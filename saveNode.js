function savePracticeNode() {
  const title = document.getElementById('new-node-title').value.trim();
  const desc = document.getElementById('new-node-desc').value.trim();
  const type = document.getElementById('new-node-type').value;
  
  if (!title) return alert('يرجى إدخال عنوان العقدة');
  
  const levels = [];
  const levelWrappers = document.querySelectorAll('.admin-level-wrapper');
  
  levelWrappers.forEach((lw, i) => {
    const questions = [];
    const qWrappers = lw.querySelectorAll('.admin-question-wrapper');
    qWrappers.forEach(w => {
      const qType = w.dataset.type;
      const text = w.querySelector('.q-text').value.trim();
      if (!text) return;
      
      if (qType === 'translate') {
        const words = w.querySelector('.q-words').value.split('+').map(s=>s.trim()).filter(s=>s);
        const correct = w.querySelector('.q-correct').value.split('+').map(s=>s.trim()).filter(s=>s);
        questions.push({ type: 'translate', text, words, correct });
      } else if (qType === 'mcq') {
        const options = w.querySelector('.q-options').value.split('+').map(s=>s.trim()).filter(s=>s);
        const correct = parseInt(w.querySelector('.q-correct').value) - 1;
        questions.push({ type: 'mcq', text, options, correct });
      }
    });
    
    if (questions.length > 0) {
      levels.push({
        id: i + 1,
        title: `المستوى ${i + 1}`,
        questions
      });
    }
  });
  
  if (editingNodeId) {
    const node = practiceNodes.find(n => n.id === editingNodeId);
    if (node) {
      node.title = title;
      node.desc = desc;
      node.type = type;
      node.levels = levels;
      delete node.questions; // clean up old format
    }
  } else {
    const newId = practiceNodes.length > 0 ? Math.max(...practiceNodes.map(n=>n.id)) + 1 : 1;
