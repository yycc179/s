function select_draw(name, [value, text], current) {
    // var op = $(`<option value=${data[0]}>${data[1]}</option>)`);
    // if (data[0] == current) op.attr('selected', true);
    var op = $(`<option value=${value}>${text}</option>)`);
    if (value == current) op.attr('selected', true);
    $(name).append(op);
}