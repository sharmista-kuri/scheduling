def time_str2int(time):
    """
    Input: Time in 24H string format (08:00)

    Output: Integer value as minutes after midnight
    """
    split_time = time.split(":")
    hour = int(split_time[0])
    minute = int(split_time[1])
    return 60 * hour + minute


def time_int2str(time):
    """
    Input: Integer value as minutes after midnight

    Output: Time in 24H string format (08:00)
    """
    if type(time) != int:
        return None
    hour = time // 60
    minute = time % 60
    if minute < 10:
        minute = f"0{minute}"
    return f"{hour}:{minute}"
