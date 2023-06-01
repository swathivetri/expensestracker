const Sequelize=require('sequelize');
const connection=require('../util/database');

const Downloadfilerecord=connection.define('downloadexpenserecord',{
    id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    filename:Sequelize.STRING,
    downloaddate:Sequelize.DATE
})

module.exports=Downloadfilerecord;