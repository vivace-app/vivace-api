'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
    dbm = options.dbmigrate;
    type = dbm.dataType;
    seed = seedLink;
};

exports.up = function (db) {
    db.createTable('score', {
        id: { type: 'int', autoIncrement: true, primaryKey: true },
        name: 'string',
        music: 'string',
        level: 'string',
        score: 'int',
        active: { type: 'boolean', defaultValue: true },
        created_at: 'datetime',
        updated_at: 'datetime'
    });
    return null;
};

exports.down = function (db) {
    db.dropTable('score');
    return null;
};

exports._meta = {
    "version": 1
};
