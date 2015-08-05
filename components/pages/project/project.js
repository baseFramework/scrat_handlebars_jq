module.exports = {
    getCreateConfig : function (data){
        return {
            action : '/project',
            title : '添加新项目',
            inputs : {
                name : {
                    label : '名称(中文)',
                    required : true,
                    reg : /^[\s\S]{1,20}$/,
                    message : {
                        reg : '要20个字符以内'
                    }
                },
                code : {
                    label : '编码(英文)',
                    required: true,
                    reg : /^\w{1,20}$/,
                    message : {
                        reg : '请输入20个以内的英文字符'
                    }
                },
                description: {
                    type : 'textarea',
                    label : '描述信息'
                }
            }
        };
    }
};


