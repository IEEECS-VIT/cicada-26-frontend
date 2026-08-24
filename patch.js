const fs = require('fs');

let css = fs.readFileSync('src/pages/Dashboard.module.css', 'utf-8');

css = css.replace('min-height: 100vh;', 'height: 100vh;');
css = css.replace(/padding: 38px 44px 52px;/, 'padding: 100px 44px 20px;');
css = css.replace(/min-height: 100vh;/, 'height: 100vh;');
css = css.replace(/align-items: flex-end; justify-content: space-between; gap: 40px;/, 'align-items: center; justify-content: space-between; gap: 40px;');

// reduce paddings to prevent scroll
css = css.replace(/padding: 44px 46px 40px;/, 'padding: 30px 40px 24px;');
css = css.replace(/gap: 38px;/, 'gap: 24px;');
css = css.replace(/gap: 30px;/, 'gap: 20px;');
css = css.replace(/padding: 44px 40px;/, 'padding: 30px 40px;');
css = css.replace(/width: 214px; height: 214px;/, 'width: 180px; height: 180px;');

fs.writeFileSync('src/pages/Dashboard.module.css', css);
