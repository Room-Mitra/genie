const CheckIn = () => {
    return (<>
        <h1>CHECK IN </h1>

        <div>
            <label>Enter Room ID</label>
            <input type="text" name="roomID"></input>
            <br />
            <br />
            <br />
        </div>

        <div>
            <label>Enter Guest ID</label>
            <input type="text" name="guestID"></input>
            <br />
            <span> Enter Guest Phone Number, if unavailable Enter Email ID</span>
            <br />
            <button> Fetch Guest Details</button>
        </div>

        <div>
            <br />
            <br />
            <br />
            <form>
                <label htmlFor="guestName"> Guest Name</label>
                <input type="text" id="guestName" name="guestName"></input>

                <label htmlFor="guestPhone"> Guest Phone Number</label>
                <input type="text" id="guestPhone" name="guestPhone"></input>

                <label htmlFor="guestEmail"> Guest Email ID</label>
                <input type="text" id="guestEmail" name="guestEmail"></input>

                <label htmlFor="guestTags"> Guest Tags</label>
                <input type="text" id="guestTags" name="guestTags"></input>

            </form>
        </div>
    </>)
}

export default CheckIn;