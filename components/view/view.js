view = {};

// 存储各页面状态，便于各页面间共享
view.state = {};
// 全部页面
view.pages = {
    index:require('pages/index')
};

view.init = function (ctx, next) {
    console.log(1234);
    ctx.state.view = view.state;

    var pages = view.pages,
        prevPage = view.state.page,
        currPage = ctx.pathname.slice(1);

    if (prevPage && prevPage !== currPage) {
        if (prevPage === 'index') {
            pages[prevPage].hide();
        } else if (pages.hasOwnProperty(prevPage)) {
            pages[prevPage].exit();
        }
    }

    if (!prevPage) {
        window.pageInited = true;
    }

    next();
};

exports = view;